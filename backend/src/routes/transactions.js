const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const transactionController = require('../controllers/transaction');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

// Get all transactions with filtering and pagination
router.get(
  '/',
  auth,
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('type').optional().isIn(['income', 'expense', 'transfer']),
    query('accountId').optional().isUUID(),
    query('categoryId').optional().isUUID(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  transactionController.getTransactions
);

// Get transaction by ID
router.get(
  '/:id',
  auth,
  [query('id').isUUID()],
  validate,
  transactionController.getTransaction
);

// Create new transaction
router.post(
  '/',
  auth,
  [
    body('accountId').isUUID(),
    body('accountType').isIn(['bank', 'credit']),
    body('amount').isFloat({ min: 0.01 }),
    body('type').isIn(['income', 'expense', 'transfer']),
    body('description').trim().notEmpty(),
    body('date').isISO8601(),
    body('categoryId').optional().isUUID(),
    body('merchant').optional().trim(),
    body('tags').optional().isArray(),
    body('notes').optional().trim(),
  ],
  validate,
  transactionController.createTransaction
);

// Update transaction
router.put(
  '/:id',
  auth,
  [
    body('accountId').optional().isUUID(),
    body('accountType').optional().isIn(['bank', 'credit']),
    body('amount').optional().isFloat({ min: 0.01 }),
    body('type').optional().isIn(['income', 'expense', 'transfer']),
    body('description').optional().trim().notEmpty(),
    body('date').optional().isISO8601(),
    body('categoryId').optional().isUUID(),
    body('merchant').optional().trim(),
    body('tags').optional().isArray(),
    body('notes').optional().trim(),
  ],
  validate,
  transactionController.updateTransaction
);

// Delete transaction
router.delete(
  '/:id',
  auth,
  [query('id').isUUID()],
  validate,
  transactionController.deleteTransaction
);

// Bulk create transactions
router.post(
  '/bulk',
  auth,
  [
    body('transactions').isArray(),
    body('transactions.*.accountId').isUUID(),
    body('transactions.*.accountType').isIn(['bank', 'credit']),
    body('transactions.*.amount').isFloat({ min: 0.01 }),
    body('transactions.*.type').isIn(['income', 'expense', 'transfer']),
    body('transactions.*.description').trim().notEmpty(),
    body('transactions.*.date').isISO8601(),
    body('transactions.*.categoryId').optional().isUUID(),
    body('transactions.*.merchant').optional().trim(),
    body('transactions.*.tags').optional().isArray(),
    body('transactions.*.notes').optional().trim(),
  ],
  validate,
  transactionController.bulkCreateTransactions
);

// Get transaction statistics
router.get(
  '/stats/summary',
  auth,
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('accountId').optional().isUUID(),
    query('categoryId').optional().isUUID(),
  ],
  validate,
  transactionController.getTransactionStats
);

// Get recurring transactions
router.get(
  '/recurring',
  auth,
  [
    query('accountId').optional().isUUID(),
    query('isActive').optional().isBoolean(),
  ],
  validate,
  transactionController.getRecurringTransactions
);

module.exports = router; 