const { BankAccount, CreditCard, Transaction, Investment, Goal, Loan, RecurringTransaction, Insurance, Category, InsuranceCategory } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models');

// Clear all data
exports.clearAllData = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    // Delete all transactions first
    await Transaction.destroy({
      where: { userId: req.user.userId },
      transaction: t
    });

    // Delete all recurring transactions
    await RecurringTransaction.destroy({
      where: { userId: req.user.userId },
      transaction: t
    });

    // Delete all bank accounts
    await BankAccount.destroy({
      where: { userId: req.user.userId },
      transaction: t
    });

    // Delete all credit cards
    await CreditCard.destroy({
      where: { userId: req.user.userId },
      transaction: t
    });

    // Delete all investments
    await Investment.destroy({
      where: { userId: req.user.userId },
      transaction: t
    });

    // Delete all goals
    await Goal.destroy({
      where: { userId: req.user.userId },
      transaction: t
    });

    // Delete all loans
    await Loan.destroy({
      where: { userId: req.user.userId },
      transaction: t
    });

    // Delete all insurance
    await Insurance.destroy({
      where: { userId: req.user.userId },
      transaction: t
    });

    // Delete all categories
    await Category.destroy({
      where: { userId: req.user.userId },
      transaction: t
    });

    // Delete all insurance categories
    await InsuranceCategory.destroy({
      where: { userId: req.user.userId },
      transaction: t
    });

    await t.commit();
    res.json({ message: 'All data cleared successfully' });
  } catch (error) {
    await t.rollback();
    console.error('Clear all data error:', error);
    res.status(500).json({ message: 'Error clearing data' });
  }
};

// Bank Account Controllers
exports.getBankAccounts = async (req, res) => {
  try {
    const accounts = await BankAccount.findAll({
      where: { userId: req.user.userId },
      order: [['name', 'ASC']],
    });

    res.json(accounts);
  } catch (error) {
    console.error('Get bank accounts error:', error);
    res.status(500).json({ message: 'Error fetching bank accounts' });
  }
};

exports.getBankAccount = async (req, res) => {
  try {
    const account = await BankAccount.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
    });

    if (!account) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    res.json(account);
  } catch (error) {
    console.error('Get bank account error:', error);
    res.status(500).json({ message: 'Error fetching bank account' });
  }
};

exports.createBankAccount = async (req, res) => {
  try {
    const account = await BankAccount.create({
      userId: req.user.userId,
      ...req.body,
    });

    res.status(201).json(account);
  } catch (error) {
    console.error('Create bank account error:', error);
    res.status(500).json({ message: 'Error creating bank account' });
  }
};

exports.updateBankAccount = async (req, res) => {
  try {
    const account = await BankAccount.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
    });

    if (!account) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    await account.update(req.body);

    res.json(account);
  } catch (error) {
    console.error('Update bank account error:', error);
    res.status(500).json({ message: 'Error updating bank account' });
  }
};

exports.deleteBankAccount = async (req, res) => {
  try {
    const account = await BankAccount.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
    });

    if (!account) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    // Check if account has transactions
    const transactionCount = await Transaction.count({
      where: {
        accountId: account.id,
        accountType: 'bank',
      },
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete account with existing transactions',
      });
    }

    await account.destroy();

    res.json({ message: 'Bank account deleted successfully' });
  } catch (error) {
    console.error('Delete bank account error:', error);
    res.status(500).json({ message: 'Error deleting bank account' });
  }
};

// Credit Card Controllers
exports.getCreditCards = async (req, res) => {
  try {
    const cards = await CreditCard.findAll({
      where: { userId: req.user.userId },
      order: [['name', 'ASC']],
    });

    res.json(cards);
  } catch (error) {
    console.error('Get credit cards error:', error);
    res.status(500).json({ message: 'Error fetching credit cards' });
  }
};

exports.getCreditCard = async (req, res) => {
  try {
    const card = await CreditCard.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
    });

    if (!card) {
      return res.status(404).json({ message: 'Credit card not found' });
    }

    res.json(card);
  } catch (error) {
    console.error('Get credit card error:', error);
    res.status(500).json({ message: 'Error fetching credit card' });
  }
};

exports.createCreditCard = async (req, res) => {
  try {
    const card = await CreditCard.create({
      userId: req.user.userId,
      ...req.body,
    });

    res.status(201).json(card);
  } catch (error) {
    console.error('Create credit card error:', error);
    res.status(500).json({ message: 'Error creating credit card' });
  }
};

exports.updateCreditCard = async (req, res) => {
  try {
    const card = await CreditCard.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
    });

    if (!card) {
      return res.status(404).json({ message: 'Credit card not found' });
    }

    await card.update(req.body);

    res.json(card);
  } catch (error) {
    console.error('Update credit card error:', error);
    res.status(500).json({ message: 'Error updating credit card' });
  }
};

exports.deleteCreditCard = async (req, res) => {
  try {
    const card = await CreditCard.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
    });

    if (!card) {
      return res.status(404).json({ message: 'Credit card not found' });
    }

    // Check if card has transactions
    const transactionCount = await Transaction.count({
      where: {
        accountId: card.id,
        accountType: 'credit',
      },
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete card with existing transactions',
      });
    }

    await card.destroy();

    res.json({ message: 'Credit card deleted successfully' });
  } catch (error) {
    console.error('Delete credit card error:', error);
    res.status(500).json({ message: 'Error deleting credit card' });
  }
};

// Account Statistics
exports.getAccountStats = async (req, res) => {
  try {
    // Get bank account statistics
    const bankAccounts = await BankAccount.findAll({
      where: { userId: req.user.userId },
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('balance')), 'totalBalance'],
      ],
      group: ['type'],
      raw: true,
    });

    // Get credit card statistics
    const creditCards = await CreditCard.findAll({
      where: { userId: req.user.userId },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('balance')), 'totalBalance'],
        [sequelize.fn('SUM', sequelize.col('creditLimit')), 'totalCreditLimit'],
      ],
      raw: true,
    });

    // Calculate total available credit
    const totalAvailableCredit = creditCards[0]?.totalCreditLimit - creditCards[0]?.totalBalance || 0;

    // Format the response
    const stats = {
      bankAccounts: bankAccounts.reduce((acc, account) => {
        acc[account.type] = {
          count: parseInt(account.count),
          totalBalance: parseFloat(account.totalBalance || 0),
        };
        return acc;
      }, {}),
      creditCards: {
        count: parseInt(creditCards[0]?.count || 0),
        totalBalance: parseFloat(creditCards[0]?.totalBalance || 0),
        totalCreditLimit: parseFloat(creditCards[0]?.totalCreditLimit || 0),
        totalAvailableCredit: parseFloat(totalAvailableCredit),
      },
    };

    res.json(stats);
  } catch (error) {
    console.error('Get account stats error:', error);
    res.status(500).json({ message: 'Error fetching account statistics' });
  }
}; 