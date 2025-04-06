const { Transaction, Category, BankAccount, CreditCard } = require('../models');
const { Op } = require('sequelize');

async function generateMonthlyReport(userId, year, month) {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Get all transactions for the month
    const transactions = await Transaction.findAll({
      where: {
        userId,
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          model: Category,
          attributes: ['id', 'name', 'type', 'icon', 'color'],
        },
      ],
      order: [['date', 'ASC']],
    });

    // Calculate totals by type
    const totals = {
      income: 0,
      expense: 0,
      transfer: 0,
    };

    // Calculate totals by category
    const categoryTotals = {};

    // Process transactions
    for (const transaction of transactions) {
      totals[transaction.type] += parseFloat(transaction.amount);

      if (transaction.categoryId) {
        const categoryName = transaction.Category.name;
        if (!categoryTotals[categoryName]) {
          categoryTotals[categoryName] = {
            amount: 0,
            count: 0,
            type: transaction.Category.type,
            icon: transaction.Category.icon,
            color: transaction.Category.color,
          };
        }
        categoryTotals[categoryName].amount += parseFloat(transaction.amount);
        categoryTotals[categoryName].count += 1;
      }
    }

    // Get account balances
    const bankAccounts = await BankAccount.findAll({
      where: { userId },
      attributes: ['id', 'name', 'type', 'balance', 'currency'],
    });

    const creditCards = await CreditCard.findAll({
      where: { userId },
      attributes: ['id', 'name', 'currentBalance', 'creditLimit', 'availableCredit'],
    });

    // Calculate net worth
    const netWorth = bankAccounts.reduce((total, account) => total + parseFloat(account.balance), 0) -
      creditCards.reduce((total, card) => total + parseFloat(card.currentBalance), 0);

    // Generate report
    const report = {
      period: {
        year,
        month,
        startDate,
        endDate,
      },
      summary: {
        totalIncome: totals.income,
        totalExpenses: totals.expense,
        totalTransfers: totals.transfer,
        netIncome: totals.income - totals.expense,
      },
      categoryBreakdown: Object.entries(categoryTotals).map(([name, data]) => ({
        name,
        ...data,
      })),
      accounts: {
        bankAccounts: bankAccounts.map(account => ({
          id: account.id,
          name: account.name,
          type: account.type,
          balance: account.balance,
          currency: account.currency,
        })),
        creditCards: creditCards.map(card => ({
          id: card.id,
          name: card.name,
          currentBalance: card.currentBalance,
          creditLimit: card.creditLimit,
          availableCredit: card.availableCredit,
        })),
      },
      netWorth,
      transactions: transactions.map(transaction => ({
        id: transaction.id,
        date: transaction.date,
        amount: transaction.amount,
        type: transaction.type,
        description: transaction.description,
        category: transaction.Category ? {
          id: transaction.Category.id,
          name: transaction.Category.name,
          type: transaction.Category.type,
          icon: transaction.Category.icon,
          color: transaction.Category.color,
        } : null,
        merchant: transaction.merchant,
        location: transaction.location,
      })),
    };

    return report;
  } catch (error) {
    console.error('Error generating monthly report:', error);
    throw error;
  }
}

async function generateYearlyReport(userId, year) {
  try {
    const monthlyReports = [];
    let yearlyTotals = {
      income: 0,
      expense: 0,
      transfer: 0,
    };

    // Generate reports for each month
    for (let month = 1; month <= 12; month++) {
      const monthlyReport = await generateMonthlyReport(userId, year, month);
      monthlyReports.push(monthlyReport);

      // Add to yearly totals
      yearlyTotals.income += monthlyReport.summary.totalIncome;
      yearlyTotals.expense += monthlyReport.summary.totalExpenses;
      yearlyTotals.transfer += monthlyReport.summary.totalTransfers;
    }

    // Calculate category totals for the year
    const yearlyCategoryTotals = {};
    for (const monthlyReport of monthlyReports) {
      for (const category of monthlyReport.categoryBreakdown) {
        if (!yearlyCategoryTotals[category.name]) {
          yearlyCategoryTotals[category.name] = {
            amount: 0,
            count: 0,
            type: category.type,
            icon: category.icon,
            color: category.color,
          };
        }
        yearlyCategoryTotals[category.name].amount += category.amount;
        yearlyCategoryTotals[category.name].count += category.count;
      }
    }

    // Generate yearly report
    const report = {
      year,
      summary: {
        totalIncome: yearlyTotals.income,
        totalExpenses: yearlyTotals.expense,
        totalTransfers: yearlyTotals.transfer,
        netIncome: yearlyTotals.income - yearlyTotals.expense,
      },
      categoryBreakdown: Object.entries(yearlyCategoryTotals).map(([name, data]) => ({
        name,
        ...data,
      })),
      monthlyBreakdown: monthlyReports.map(report => ({
        month: report.period.month,
        income: report.summary.totalIncome,
        expenses: report.summary.totalExpenses,
        netIncome: report.summary.netIncome,
      })),
    };

    return report;
  } catch (error) {
    console.error('Error generating yearly report:', error);
    throw error;
  }
}

module.exports = {
  generateMonthlyReport,
  generateYearlyReport,
}; 