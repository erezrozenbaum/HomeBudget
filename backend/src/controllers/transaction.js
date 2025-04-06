const { Transaction, Category, BankAccount, CreditCard, RecurringTransaction, Investment } = require('../models');
const { Op, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// Get all transactions with filtering and pagination
exports.getTransactions = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      type,
      accountId,
      categoryId,
      page = 1,
      limit = 20,
    } = req.query;

    // Build where clause
    const where = { userId: req.user.userId };

    if (startDate && endDate) {
      where.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else if (startDate) {
      where.date = {
        [Op.gte]: new Date(startDate),
      };
    } else if (endDate) {
      where.date = {
        [Op.lte]: new Date(endDate),
      };
    }

    if (type) where.type = type;
    if (accountId) where.accountId = accountId;
    if (categoryId) where.categoryId = categoryId;

    // Get transactions with pagination
    const offset = (page - 1) * limit;
    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'type', 'icon', 'color']
        },
        {
          model: Investment,
          as: 'investment',
          attributes: ['id', 'name', 'type', 'currentValue']
        }
      ],
      order: [['date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Calculate totals using Sequelize.literal
    const totals = await Transaction.findAll({
      where,
      attributes: [
        [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN type = 'income' THEN amount ELSE 0 END")), 'totalIncome'],
        [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN type = 'expense' THEN amount ELSE 0 END")), 'totalExpenses'],
        [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN type = 'transfer' THEN amount ELSE 0 END")), 'totalTransfers'],
      ],
      raw: true,
    });

    res.json({
      transactions,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
      totals: totals[0],
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Error fetching transactions' });
  }
};

// Get transaction by ID
exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
      include: [
        {
          model: Category,
          attributes: ['id', 'name', 'type', 'icon', 'color'],
        },
        {
          model: Investment,
          as: 'investment',
          attributes: ['id', 'name', 'type', 'currentValue']
        }
      ],
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ message: 'Error fetching transaction' });
  }
};

// Create new transaction
exports.createTransaction = async (req, res) => {
  try {
    const {
      accountId,
      accountType,
      amount,
      type,
      description,
      date,
      categoryId,
      merchant,
      tags,
      notes,
    } = req.body;

    // Start a transaction to ensure data consistency
    const result = await sequelize.transaction(async (t) => {
      // Create the transaction
      const transaction = await Transaction.create({
        userId: req.user.userId,
        accountId,
        accountType,
        amount,
        type,
        description,
        date: new Date(date),
        categoryId,
        merchant,
        tags: tags || [],
        notes,
      }, { transaction: t });

      // Update account balance
      if (accountType === 'bank') {
        const account = await BankAccount.findByPk(accountId, { transaction: t });
        if (!account) {
          throw new Error('Bank account not found');
        }

        const balanceChange = type === 'income' ? amount : -amount;
        await account.update({
          balance: account.balance + balanceChange,
          lastUpdated: new Date(),
        }, { transaction: t });
      } else {
        const card = await CreditCard.findByPk(accountId, { transaction: t });
        if (!card) {
          throw new Error('Credit card not found');
        }

        const balanceChange = type === 'expense' ? amount : -amount;
        const newBalance = card.balance + balanceChange;
        await card.update({
          balance: newBalance,
          lastUpdated: new Date(),
        }, { transaction: t });
      }

      return transaction;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Error creating transaction' });
  }
};

// Update transaction
exports.updateTransaction = async (req, res) => {
  try {
    // Find the transaction
    const transaction = await Transaction.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Start a transaction to ensure data consistency
    await sequelize.transaction(async (t) => {
      // Calculate balance adjustment
      let balanceAdjustment = 0;
      
      if (req.body.amount !== undefined || req.body.type !== undefined) {
        const oldAmount = transaction.amount;
        const newAmount = req.body.amount !== undefined ? req.body.amount : oldAmount;
        const oldType = transaction.type;
        const newType = req.body.type !== undefined ? req.body.type : oldType;
        
        // Calculate the difference in balance impact
        const oldBalanceImpact = oldType === 'income' ? oldAmount : -oldAmount;
        const newBalanceImpact = newType === 'income' ? newAmount : -newAmount;
        
        balanceAdjustment = newBalanceImpact - oldBalanceImpact;
      }

      // Update the transaction
      await transaction.update(req.body, { transaction: t });

      // Update account balance if needed
      if (balanceAdjustment !== 0) {
        if (transaction.accountType === 'bank') {
          const account = await BankAccount.findByPk(transaction.accountId, { transaction: t });
          if (account) {
            await account.update({
              balance: account.balance + balanceAdjustment,
              lastUpdated: new Date(),
            }, { transaction: t });
          }
        } else {
          const card = await CreditCard.findByPk(transaction.accountId, { transaction: t });
          if (card) {
            const newBalance = card.balance + balanceAdjustment;
            await card.update({
              balance: newBalance,
              lastUpdated: new Date(),
            }, { transaction: t });
          }
        }
      }
    });

    // Fetch the updated transaction with category
    const updatedTransaction = await Transaction.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
      include: [
        {
          model: Category,
          attributes: ['id', 'name', 'type', 'icon', 'color'],
        },
      ],
    });

    res.json(updatedTransaction);
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Error updating transaction' });
  }
};

// Delete transaction
exports.deleteTransaction = async (req, res) => {
  try {
    // Find the transaction
    const transaction = await Transaction.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Start a transaction to ensure data consistency
    await sequelize.transaction(async (t) => {
      // Calculate balance adjustment
      const balanceAdjustment = transaction.type === 'income' ? -transaction.amount : transaction.amount;

      // Update account balance
      if (transaction.accountType === 'bank') {
        const account = await BankAccount.findByPk(transaction.accountId, { transaction: t });
        if (account) {
          await account.update({
            balance: account.balance + balanceAdjustment,
            lastUpdated: new Date(),
          }, { transaction: t });
        }
      } else {
        const card = await CreditCard.findByPk(transaction.accountId, { transaction: t });
        if (card) {
          const newBalance = card.balance + balanceAdjustment;
          await card.update({
            balance: newBalance,
            lastUpdated: new Date(),
          }, { transaction: t });
        }
      }

      // Delete the transaction
      await transaction.destroy({ transaction: t });
    });

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Error deleting transaction' });
  }
};

// Bulk create transactions
exports.bulkCreateTransactions = async (req, res) => {
  try {
    const { transactions } = req.body;

    // Start a transaction to ensure data consistency
    const result = await sequelize.transaction(async (t) => {
      const createdTransactions = [];

      for (const transactionData of transactions) {
        const transaction = await Transaction.create({
          userId: req.user.userId,
          ...transactionData,
          date: new Date(transactionData.date),
          tags: transactionData.tags || [],
        }, { transaction: t });

        // Update account balance
        if (transactionData.accountType === 'bank') {
          const account = await BankAccount.findByPk(transactionData.accountId, { transaction: t });
          if (!account) {
            throw new Error(`Bank account not found: ${transactionData.accountId}`);
          }

          const balanceChange = transactionData.type === 'income' ? transactionData.amount : -transactionData.amount;
          await account.update({
            balance: account.balance + balanceChange,
            lastUpdated: new Date(),
          }, { transaction: t });
        } else {
          const card = await CreditCard.findByPk(transactionData.accountId, { transaction: t });
          if (!card) {
            throw new Error(`Credit card not found: ${transactionData.accountId}`);
          }

          const balanceChange = transactionData.type === 'expense' ? transactionData.amount : -transactionData.amount;
          const newBalance = card.balance + balanceChange;
          await card.update({
            balance: newBalance,
            lastUpdated: new Date(),
          }, { transaction: t });
        }

        createdTransactions.push(transaction);
      }

      return createdTransactions;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Bulk create transactions error:', error);
    res.status(500).json({ message: 'Error creating transactions' });
  }
};

// Get transaction statistics
exports.getTransactionStats = async (req, res) => {
  try {
    const { startDate, endDate, accountId, categoryId } = req.query;
    
    // Build where clause
    const where = { userId: req.user.userId };

    if (startDate && endDate) {
      where.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else if (startDate) {
      where.date = {
        [Op.gte]: new Date(startDate),
      };
    } else if (endDate) {
      where.date = {
        [Op.lte]: new Date(endDate),
      };
    }

    if (accountId) where.accountId = accountId;
    if (categoryId) where.categoryId = categoryId;

    // Get transaction counts and totals by type
    const typeStats = await Transaction.findAll({
      where,
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
      ],
      group: ['type'],
      raw: true,
    });

    // Get top categories
    const topCategories = await Transaction.findAll({
      where,
      attributes: [
        'categoryId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
      ],
      include: [
        {
          model: Category,
          attributes: ['name', 'type', 'icon', 'color'],
        },
      ],
      group: ['categoryId', 'Category.id'],
      order: [[sequelize.literal('total'), 'DESC']],
      limit: 5,
      raw: true,
      nest: true,
    });

    // Get top merchants
    const topMerchants = await Transaction.findAll({
      where: {
        ...where,
        merchant: { [Op.ne]: null },
      },
      attributes: [
        'merchant',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
      ],
      group: ['merchant'],
      order: [[sequelize.literal('total'), 'DESC']],
      limit: 5,
      raw: true,
    });

    // Format the response
    const stats = {
      byType: typeStats.reduce((acc, stat) => {
        acc[stat.type] = {
          count: parseInt(stat.count),
          total: parseFloat(stat.total || 0),
        };
        return acc;
      }, {}),
      topCategories: topCategories.map(cat => ({
        name: cat.Category.name,
        type: cat.Category.type,
        icon: cat.Category.icon,
        color: cat.Category.color,
        count: parseInt(cat.count),
        total: parseFloat(cat.total || 0),
      })),
      topMerchants: topMerchants.map(merchant => ({
        name: merchant.merchant,
        count: parseInt(merchant.count),
        total: parseFloat(merchant.total || 0),
      })),
    };

    res.json(stats);
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({ message: 'Error fetching transaction statistics' });
  }
};

// Get recurring transactions
exports.getRecurringTransactions = async (req, res) => {
  try {
    const { accountId, isActive } = req.query;

    const where = { userId: req.user.userId };
    if (accountId) where.accountId = accountId;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const recurringTransactions = await RecurringTransaction.findAll({
      where,
      include: [
        {
          model: Category,
          attributes: ['id', 'name', 'type', 'icon', 'color'],
        },
      ],
      order: [['nextProcessDate', 'ASC']],
    });

    res.json(recurringTransactions);
  } catch (error) {
    console.error('Get recurring transactions error:', error);
    res.status(500).json({ message: 'Error fetching recurring transactions' });
  }
}; 