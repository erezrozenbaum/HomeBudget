const express = require('express');
const router = express.Router();
const { body, query, param } = require('express-validator');
const accountController = require('../controllers/account');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

// Clear sample data route
router.delete(
  '/clear-all-data',
  auth,
  accountController.clearAllData
);

// Bank Accounts routes
router.get(
  '/bank',
  auth,
  accountController.getBankAccounts
);

router.get(
  '/bank/:id',
  auth,
  [query('id').isUUID()],
  validate,
  accountController.getBankAccount
);

router.post(
  '/bank',
  auth,
  [
    body('name').trim().notEmpty(),
    body('type').isIn(['checking', 'savings', 'investment', 'other']),
    body('balance').isFloat({ min: 0 }),
    body('currency').isLength({ min: 3, max: 3 }),
    body('institution').trim().notEmpty(),
    body('accountNumber').optional().trim(),
    body('routingNumber').optional().trim(),
    body('notes').optional().trim(),
  ],
  validate,
  accountController.createBankAccount
);

router.put(
  '/bank/:id',
  auth,
  [
    body('name').optional().trim().notEmpty(),
    body('type').optional().isIn(['checking', 'savings', 'investment', 'other']),
    body('balance').optional().isFloat({ min: 0 }),
    body('currency').optional().isLength({ min: 3, max: 3 }),
    body('institution').optional().trim().notEmpty(),
    body('accountNumber').optional().trim(),
    body('routingNumber').optional().trim(),
    body('notes').optional().trim(),
  ],
  validate,
  accountController.updateBankAccount
);

router.delete(
  '/bank/:id',
  auth,
  [body('id').optional(), param('id').isUUID()],
  validate,
  accountController.deleteBankAccount
);

// Credit Cards routes
router.get(
  '/credit',
  auth,
  accountController.getCreditCards
);

router.get(
  '/credit/:id',
  auth,
  [query('id').isUUID()],
  validate,
  accountController.getCreditCard
);

router.post(
  '/credit',
  auth,
  [
    body('name').trim().notEmpty(),
    body('balance').isFloat({ min: 0 }),
    body('creditLimit').isFloat({ min: 0 }),
    body('currency').isLength({ min: 3, max: 3 }),
    body('institution').trim().notEmpty(),
    body('cardNumber').optional().trim(),
    body('expiryDate').optional().isISO8601(),
    body('notes').optional().trim(),
  ],
  validate,
  accountController.createCreditCard
);

router.put(
  '/credit/:id',
  auth,
  [
    body('name').optional().trim().notEmpty(),
    body('balance').optional().isFloat({ min: 0 }),
    body('creditLimit').optional().isFloat({ min: 0 }),
    body('currency').optional().isLength({ min: 3, max: 3 }),
    body('institution').optional().trim().notEmpty(),
    body('cardNumber').optional().trim(),
    body('expiryDate').optional().isISO8601(),
    body('notes').optional().trim(),
  ],
  validate,
  accountController.updateCreditCard
);

router.delete(
  '/credit/:id',
  auth,
  [query('id').isUUID()],
  validate,
  accountController.deleteCreditCard
);

// Account statistics
router.get(
  '/stats',
  auth,
  accountController.getAccountStats
);

module.exports = router; 