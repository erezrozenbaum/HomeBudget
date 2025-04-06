const { RecurringTransaction, Transaction, BankAccount, CreditCard } = require('../models');
const { Op } = require('sequelize');

async function processRecurringTransactions() {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Find all active recurring transactions that are due
    const recurringTransactions = await RecurringTransaction.findAll({
      where: {
        isActive: true,
        nextProcessDate: {
          [Op.lte]: today,
        },
        [Op.or]: [
          { endDate: null },
          { endDate: { [Op.gte]: today } },
        ],
      },
    });

    for (const recurringTransaction of recurringTransactions) {
      try {
        // Create the transaction
        const transaction = await Transaction.create({
          userId: recurringTransaction.userId,
          accountId: recurringTransaction.accountId,
          accountType: recurringTransaction.accountType,
          amount: recurringTransaction.amount,
          type: recurringTransaction.type,
          description: recurringTransaction.description,
          date: recurringTransaction.nextProcessDate,
          categoryId: recurringTransaction.categoryId,
          merchant: recurringTransaction.merchant,
          isRecurring: true,
          recurringTransactionId: recurringTransaction.id,
        });

        // Update account balance
        if (recurringTransaction.accountType === 'bank') {
          const account = await BankAccount.findByPk(recurringTransaction.accountId);
          if (account) {
            const balanceChange = recurringTransaction.type === 'income' ? recurringTransaction.amount : -recurringTransaction.amount;
            await account.update({
              balance: account.balance + balanceChange,
              lastUpdated: new Date(),
            });
          }
        } else {
          const card = await CreditCard.findByPk(recurringTransaction.accountId);
          if (card) {
            const balanceChange = recurringTransaction.type === 'expense' ? recurringTransaction.amount : -recurringTransaction.amount;
            const newBalance = card.currentBalance + balanceChange;
            await card.update({
              currentBalance: newBalance,
              availableCredit: card.creditLimit - newBalance,
              lastUpdated: new Date(),
            });
          }
        }

        // Calculate next process date
        const nextProcessDate = new Date(recurringTransaction.nextProcessDate);
        switch (recurringTransaction.frequency) {
          case 'daily':
            nextProcessDate.setDate(nextProcessDate.getDate() + 1);
            break;
          case 'weekly':
            nextProcessDate.setDate(nextProcessDate.getDate() + 7);
            break;
          case 'biweekly':
            nextProcessDate.setDate(nextProcessDate.getDate() + 14);
            break;
          case 'monthly':
            nextProcessDate.setMonth(nextProcessDate.getMonth() + 1);
            break;
          case 'quarterly':
            nextProcessDate.setMonth(nextProcessDate.getMonth() + 3);
            break;
          case 'annually':
            nextProcessDate.setFullYear(nextProcessDate.getFullYear() + 1);
            break;
        }

        // Update recurring transaction
        await recurringTransaction.update({
          lastProcessedDate: recurringTransaction.nextProcessDate,
          nextProcessDate,
        });

        console.log(`Processed recurring transaction ${recurringTransaction.id} for user ${recurringTransaction.userId}`);
      } catch (error) {
        console.error(`Error processing recurring transaction ${recurringTransaction.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in processRecurringTransactions:', error);
  }
}

// Export the function to be used by a scheduler
module.exports = processRecurringTransactions; 