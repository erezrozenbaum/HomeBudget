const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const investmentController = require('../controllers/investment');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

// Get all investments
router.get(
  '/',
  auth,
  [
    query('type').optional().isIn(['stock', 'bond', 'mutual_fund', 'etf', 'crypto', 'real_estate', 'other']),
    query('riskLevel').optional().isIn(['low', 'medium', 'high']),
  ],
  validate,
  investmentController.getInvestments
);

// Get investment by ID
router.get(
  '/:id',
  auth,
  [query('id').isUUID()],
  validate,
  investmentController.getInvestment
);

// Create new investment
router.post(
  '/',
  auth,
  [
    body('name').trim().notEmpty(),
    body('type').isIn(['stock', 'bond', 'mutual_fund', 'etf', 'crypto', 'real_estate', 'other']),
    body('amount').isFloat({ min: 0.01 }),
    body('currency').isLength({ min: 3, max: 3 }),
    body('institution').optional().trim(),
    body('accountNumber').optional().trim(),
    body('purchaseDate').optional().isISO8601(),
    body('currentValue').isFloat({ min: 0 }),
    body('returnRate').optional().isFloat(),
    body('riskLevel').optional().isIn(['low', 'medium', 'high']),
    body('notes').optional().trim(),
  ],
  validate,
  investmentController.createInvestment
);

// Update investment
router.put(
  '/:id',
  auth,
  [
    body('name').optional().trim().notEmpty(),
    body('type').optional().isIn(['stock', 'bond', 'mutual_fund', 'etf', 'crypto', 'real_estate', 'other']),
    body('amount').optional().isFloat({ min: 0.01 }),
    body('currency').optional().isLength({ min: 3, max: 3 }),
    body('institution').optional().trim(),
    body('accountNumber').optional().trim(),
    body('purchaseDate').optional().isISO8601(),
    body('currentValue').optional().isFloat({ min: 0 }),
    body('returnRate').optional().isFloat(),
    body('riskLevel').optional().isIn(['low', 'medium', 'high']),
    body('notes').optional().trim(),
  ],
  validate,
  investmentController.updateInvestment
);

// Delete investment
router.delete(
  '/:id',
  auth,
  [query('id').isUUID()],
  validate,
  investmentController.deleteInvestment
);

// Get investment statistics
router.get(
  '/stats/summary',
  auth,
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  validate,
  investmentController.getInvestmentStats
);

module.exports = router; 