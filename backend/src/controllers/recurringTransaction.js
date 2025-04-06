const { RecurringTransaction, Transaction } = require('../models');
const { Op } = require('sequelize');

// Get all recurring transactions
exports.getRecurringTransactions = async (req, res) => {
  try {
    const { accountId, isActive } = req.query;
    const where = { userId: req.user.id };

    if (accountId) {
      where.accountId = accountId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const recurringTransactions = await RecurringTransaction.findAll({
      where,
      order: [['nextProcessDate', 'ASC']],
    });

    res.json(recurringTransactions);
  } catch (error) {
    console.error('Get recurring transactions error:', error);
    res.status(500).json({ message: 'Error fetching recurring transactions' });
  }
};

// Get recurring transaction by ID
exports.getRecurringTransaction = async (req, res) => {
  try {
    const recurringTransaction = await RecurringTransaction.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!recurringTransaction) {
      return res.status(404).json({ message: 'Recurring transaction not found' });
    }

    res.json(recurringTransaction);
  } catch (error) {
    console.error('Get recurring transaction error:', error);
    res.status(500).json({ message: 'Error fetching recurring transaction' });
  }
};

// Create new recurring transaction
exports.createRecurringTransaction = async (req, res) => {
  try {
    const {
      accountId,
      accountType,
      amount,
      type,
      description,
      frequency,
      startDate,
      endDate,
      categoryId,
      merchant,
      tags,
      notes,
    } = req.body;

    // Calculate next process date based on frequency
    const nextProcessDate = calculateNextProcessDate(new Date(startDate), frequency);

    const recurringTransaction = await RecurringTransaction.create({
      userId: req.user.id,
      accountId,
      accountType,
      amount,
      type,
      description,
      frequency,
      startDate,
      endDate,
      nextProcessDate,
      categoryId,
      merchant,
      tags,
      notes,
      isActive: true,
    });

    res.status(201).json(recurringTransaction);
  } catch (error) {
    console.error('Create recurring transaction error:', error);
    res.status(500).json({ message: 'Error creating recurring transaction' });
  }
};

// Update recurring transaction
exports.updateRecurringTransaction = async (req, res) => {
  try {
    const recurringTransaction = await RecurringTransaction.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!recurringTransaction) {
      return res.status(404).json({ message: 'Recurring transaction not found' });
    }

    // If frequency or start date is updated, recalculate next process date
    if (req.body.frequency || req.body.startDate) {
      const frequency = req.body.frequency || recurringTransaction.frequency;
      const startDate = new Date(req.body.startDate || recurringTransaction.startDate);
      req.body.nextProcessDate = calculateNextProcessDate(startDate, frequency);
    }

    await recurringTransaction.update(req.body);
    res.json(recurringTransaction);
  } catch (error) {
    console.error('Update recurring transaction error:', error);
    res.status(500).json({ message: 'Error updating recurring transaction' });
  }
};

// Delete recurring transaction
exports.deleteRecurringTransaction = async (req, res) => {
  try {
    const recurringTransaction = await RecurringTransaction.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!recurringTransaction) {
      return res.status(404).json({ message: 'Recurring transaction not found' });
    }

    await recurringTransaction.destroy();
    res.json({ message: 'Recurring transaction deleted successfully' });
  } catch (error) {
    console.error('Delete recurring transaction error:', error);
    res.status(500).json({ message: 'Error deleting recurring transaction' });
  }
};

// Process recurring transactions
exports.processRecurringTransactions = async (req, res) => {
  try {
    const now = new Date();
    const recurringTransactions = await RecurringTransaction.findAll({
      where: {
        userId: req.user.id,
        isActive: true,
        nextProcessDate: {
          [Op.lte]: now,
        },
      },
    });

    const processedTransactions = [];

    for (const recurringTransaction of recurringTransactions) {
      // Create a new transaction
      const transaction = await Transaction.create({
        userId: req.user.id,
        accountId: recurringTransaction.accountId,
        accountType: recurringTransaction.accountType,
        amount: recurringTransaction.amount,
        type: recurringTransaction.type,
        description: recurringTransaction.description,
        date: recurringTransaction.nextProcessDate,
        categoryId: recurringTransaction.categoryId,
        merchant: recurringTransaction.merchant,
        tags: recurringTransaction.tags,
        notes: recurringTransaction.notes,
        isRecurring: true,
        recurringTransactionId: recurringTransaction.id,
      });

      // Calculate next process date
      const nextProcessDate = calculateNextProcessDate(
        recurringTransaction.nextProcessDate,
        recurringTransaction.frequency
      );

      // Update recurring transaction
      await recurringTransaction.update({
        lastProcessedDate: recurringTransaction.nextProcessDate,
        nextProcessDate,
      });

      processedTransactions.push(transaction);
    }

    res.json({
      message: `Processed ${processedTransactions.length} recurring transactions`,
      transactions: processedTransactions,
    });
  } catch (error) {
    console.error('Process recurring transactions error:', error);
    res.status(500).json({ message: 'Error processing recurring transactions' });
  }
};

// Helper function to calculate next process date
function calculateNextProcessDate(date, frequency) {
  const nextDate = new Date(date);
  switch (frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'biweekly':
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case 'annually':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }
  return nextDate;
} 