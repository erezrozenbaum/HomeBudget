const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const { CreditCard, Transaction } = require('../models');
const { Op } = require('sequelize');
const auth = require('../middleware/auth');

// Get all credit cards for the current user
router.get('/', auth, async (req, res) => {
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
});

// Get a specific credit card
router.get('/:id', auth, async (req, res) => {
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
});

// Create a new credit card
router.post('/', [
  auth,
  body('name').notEmpty().trim(),
  body('issuer').notEmpty().trim(),
  body('creditLimit').isFloat({ min: 0 }),
  body('currentBalance').isFloat({ min: 0 }),
  body('availableCredit').isFloat({ min: 0 }),
  body('statementDate').isInt({ min: 1, max: 31 }),
  body('dueDate').isInt({ min: 1, max: 31 }),
  body('interestRate').optional().isFloat({ min: 0 }),
  body('annualFee').optional().isFloat({ min: 0 }),
  body('rewardsProgram').optional().trim(),
  body('cardNumber').optional().trim(),
  body('expirationDate').optional().trim(),
  body('notes').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      issuer,
      creditLimit,
      currentBalance,
      availableCredit,
      statementDate,
      dueDate,
      interestRate,
      annualFee,
      rewardsProgram,
      cardNumber,
      expirationDate,
      notes,
    } = req.body;

    const card = await CreditCard.create({
      userId: req.user.userId,
      name,
      issuer,
      creditLimit,
      currentBalance,
      availableCredit,
      statementDate,
      dueDate,
      interestRate,
      annualFee,
      rewardsProgram,
      cardNumber,
      expirationDate,
      notes,
      lastUpdated: new Date(),
    });

    res.status(201).json(card);
  } catch (error) {
    console.error('Create credit card error:', error);
    res.status(500).json({ message: 'Error creating credit card' });
  }
});

// Update a credit card
router.put('/:id', [
  auth,
  body('name').optional().trim(),
  body('issuer').optional().trim(),
  body('creditLimit').optional().isFloat({ min: 0 }),
  body('currentBalance').optional().isFloat({ min: 0 }),
  body('availableCredit').optional().isFloat({ min: 0 }),
  body('statementDate').optional().isInt({ min: 1, max: 31 }),
  body('dueDate').optional().isInt({ min: 1, max: 31 }),
  body('interestRate').optional().isFloat({ min: 0 }),
  body('annualFee').optional().isFloat({ min: 0 }),
  body('rewardsProgram').optional().trim(),
  body('cardNumber').optional().trim(),
  body('expirationDate').optional().trim(),
  body('notes').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const card = await CreditCard.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
    });

    if (!card) {
      return res.status(404).json({ message: 'Credit card not found' });
    }

    // Update the card
    await card.update({
      ...req.body,
      lastUpdated: new Date(),
    });

    res.json(card);
  } catch (error) {
    console.error('Update credit card error:', error);
    res.status(500).json({ message: 'Error updating credit card' });
  }
});

// Delete a credit card
router.delete('/:id', auth, async (req, res) => {
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

    // Check if there are any transactions associated with this card
    const transactionCount = await Transaction.count({
      where: {
        accountId: req.params.id,
        accountType: 'credit',
      },
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete card with associated transactions',
        transactionCount,
      });
    }

    await card.destroy();
    res.json({ message: 'Credit card deleted successfully' });
  } catch (error) {
    console.error('Delete credit card error:', error);
    res.status(500).json({ message: 'Error deleting credit card' });
  }
});

// Get card balance history
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

    const card = await CreditCard.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
    });

    if (!card) {
      return res.status(404).json({ message: 'Credit card not found' });
    }

    const { startDate, endDate } = req.query;
    
    // Build where clause for transactions
    const where = {
      accountId: req.params.id,
      accountType: 'credit',
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
    let runningBalance = card.currentBalance;
    const balanceHistory = transactions.map(transaction => {
      const balanceChange = transaction.type === 'expense' ? transaction.amount : -transaction.amount;
      runningBalance -= balanceChange; // Subtract because we're going backwards in time
      
      return {
        date: transaction.date,
        balance: runningBalance,
        availableCredit: card.creditLimit - runningBalance,
        transactionId: transaction.id,
        amount: transaction.amount,
        type: transaction.type,
        description: transaction.description,
      };
    }).reverse(); // Reverse to get chronological order

    // Add current balance as the most recent point
    balanceHistory.push({
      date: new Date(),
      balance: card.currentBalance,
      availableCredit: card.availableCredit,
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

// Get upcoming payments
router.get('/:id/upcoming-payments', auth, async (req, res) => {
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

    // Calculate next statement date
    const today = new Date();
    const currentDay = today.getDate();
    let nextStatementDate = new Date(today);
    
    if (currentDay >= card.statementDate) {
      // If we're past the statement date, next statement is next month
      nextStatementDate.setMonth(today.getMonth() + 1);
    }
    
    nextStatementDate.setDate(card.statementDate);
    
    // Calculate next due date
    let nextDueDate = new Date(nextStatementDate);
    nextDueDate.setDate(nextStatementDate.getDate() + (card.dueDate - card.statementDate));
    
    // If due date is before statement date, it means it's in the next month
    if (card.dueDate < card.statementDate) {
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    }

    // Calculate minimum payment (typically 2-3% of balance or a fixed amount)
    const minimumPayment = Math.max(
      card.currentBalance * 0.02, // 2% of balance
      25 // Minimum $25 payment
    );

    res.json({
      nextStatementDate,
      nextDueDate,
      currentBalance: card.currentBalance,
      minimumPayment: Math.round(minimumPayment * 100) / 100,
      availableCredit: card.availableCredit,
    });
  } catch (error) {
    console.error('Get upcoming payments error:', error);
    res.status(500).json({ message: 'Error fetching upcoming payments' });
  }
});

module.exports = router; 