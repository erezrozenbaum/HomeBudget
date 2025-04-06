const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const router = express.Router();
const { BankAccount, Transaction } = require('../models');
const { Op } = require('sequelize');
const auth = require('../middleware/auth');

// Get all bank accounts for the current user
router.get('/', auth, async (req, res) => {
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
});

// Get a specific bank account
router.get('/:id', auth, async (req, res) => {
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
});

// Create a new bank account
router.post('/', [
  auth,
  body('name').notEmpty().trim(),
  body('type').isIn(['checking', 'savings', 'investment', 'other']),
  body('balance').isFloat({ min: 0 }),
  body('currency').isLength({ min: 3, max: 3 }),
  body('institution').optional().trim(),
  body('accountNumber').optional().trim(),
  body('routingNumber').optional().trim(),
  body('notes').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      type,
      balance,
      currency,
      institution,
      accountNumber,
      routingNumber,
      notes,
    } = req.body;

    const account = await BankAccount.create({
      userId: req.user.userId,
      name,
      type,
      balance,
      currency,
      institution,
      accountNumber,
      routingNumber,
      notes,
      lastUpdated: new Date(),
    });

    res.status(201).json(account);
  } catch (error) {
    console.error('Create bank account error:', error);
    res.status(500).json({ message: 'Error creating bank account' });
  }
});

// Update a bank account
router.put('/:id', [
  auth,
  body('name').optional().trim(),
  body('type').optional().isIn(['checking', 'savings', 'investment', 'other']),
  body('balance').optional().isFloat({ min: 0 }),
  body('currency').optional().isLength({ min: 3, max: 3 }),
  body('institution').optional().trim(),
  body('accountNumber').optional().trim(),
  body('routingNumber').optional().trim(),
  body('notes').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const account = await BankAccount.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
    });

    if (!account) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    // Update the account
    await account.update({
      ...req.body,
      lastUpdated: new Date(),
    });

    res.json(account);
  } catch (error) {
    console.error('Update bank account error:', error);
    res.status(500).json({ message: 'Error updating bank account' });
  }
});

// Delete a bank account
router.delete('/:id', auth, async (req, res) => {
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

    // Check if there are any transactions associated with this account
    const transactionCount = await Transaction.count({
      where: {
        accountId: req.params.id,
        accountType: 'bank',
      },
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete account with associated transactions',
        transactionCount,
      });
    }

    await account.destroy();
    res.json({ message: 'Bank account deleted successfully' });
  } catch (error) {
    console.error('Delete bank account error:', error);
    res.status(500).json({ message: 'Error deleting bank account' });
  }
});

// Get account balance history
router.get('/:id/balance-history', [
  auth,
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const account = await BankAccount.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
    });

    if (!account) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    const { startDate, endDate } = req.query;
    
    // Build where clause for transactions
    const where = {
      accountId: req.params.id,
      accountType: 'bank',
    };
    
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

    // Get transactions ordered by date
    const transactions = await Transaction.findAll({
      where,
      attributes: ['id', 'date', 'amount', 'type', 'description'],
      order: [['date', 'ASC']],
    });

    // Calculate running balance
    let runningBalance = account.balance;
    const balanceHistory = transactions.map(transaction => {
      const balanceChange = transaction.type === 'income' ? transaction.amount : -transaction.amount;
      runningBalance -= balanceChange; // Subtract because we're going backwards in time
      
      return {
        date: transaction.date,
        balance: runningBalance,
        transactionId: transaction.id,
        amount: transaction.amount,
        type: transaction.type,
        description: transaction.description,
      };
    }).reverse(); // Reverse to get chronological order

    // Add current balance as the most recent point
    balanceHistory.push({
      date: new Date(),
      balance: account.balance,
      transactionId: null,
      amount: null,
      type: null,
      description: 'Current Balance',
    });

    res.json(balanceHistory);
  } catch (error) {
    console.error('Get balance history error:', error);
    res.status(500).json({ message: 'Error fetching balance history' });
  }
});

module.exports = router; 