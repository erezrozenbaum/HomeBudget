const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const recurringTransactionController = require('../controllers/recurringTransaction');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

// Get all recurring transactions
router.get(
  '/',
  auth,
  [
    query('accountId').optional().isUUID(),
    query('isActive').optional().isBoolean(),
  ],
  validate,
  recurringTransactionController.getRecurringTransactions
);

// Get recurring transaction by ID
router.get(
  '/:id',
  auth,
  [query('id').isUUID()],
  validate,
  recurringTransactionController.getRecurringTransaction
);

// Create new recurring transaction
router.post(
  '/',
  auth,
  [
    body('accountId').isUUID(),
    body('accountType').isIn(['bank', 'credit']),
    body('amount').isFloat({ min: 0.01 }),
    body('type').isIn(['income', 'expense']),
    body('description').trim().notEmpty(),
    body('frequency').isIn(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annually']),
    body('startDate').isISO8601(),
    body('endDate').optional().isISO8601(),
    body('categoryId').optional().isUUID(),
    body('merchant').optional().trim(),
    body('tags').optional().isArray(),
    body('notes').optional().trim(),
  ],
  validate,
  recurringTransactionController.createRecurringTransaction
);

// Update recurring transaction
router.put(
  '/:id',
  auth,
  [
    body('accountId').optional().isUUID(),
    body('accountType').optional().isIn(['bank', 'credit']),
    body('amount').optional().isFloat({ min: 0.01 }),
    body('type').optional().isIn(['income', 'expense']),
    body('description').optional().trim().notEmpty(),
    body('frequency').optional().isIn(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annually']),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
    body('categoryId').optional().isUUID(),
    body('merchant').optional().trim(),
    body('tags').optional().isArray(),
    body('notes').optional().trim(),
    body('isActive').optional().isBoolean(),
  ],
  validate,
  recurringTransactionController.updateRecurringTransaction
);

// Delete recurring transaction
router.delete(
  '/:id',
  auth,
  [query('id').isUUID()],
  validate,
  recurringTransactionController.deleteRecurringTransaction
);

// Process recurring transactions
router.post(
  '/process',
  auth,
  recurringTransactionController.processRecurringTransactions
);

module.exports = router; 