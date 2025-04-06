const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const categoryController = require('../controllers/category');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

// Get all categories
router.get(
  '/',
  auth,
  [
    query('type').optional().isIn(['income', 'expense', 'transfer']),
  ],
  validate,
  categoryController.getCategories
);

// Get category by ID
router.get(
  '/:id',
  auth,
  [query('id').isUUID()],
  validate,
  categoryController.getCategory
);

// Create new category
router.post(
  '/',
  auth,
  [
    body('name').trim().notEmpty(),
    body('type').isIn(['income', 'expense', 'transfer']),
    body('icon').optional().trim(),
    body('color').optional().trim(),
    body('parentId').optional().isUUID(),
  ],
  validate,
  categoryController.createCategory
);

// Update category
router.put(
  '/:id',
  auth,
  [
    body('name').optional().trim().notEmpty(),
    body('type').optional().isIn(['income', 'expense', 'transfer']),
    body('icon').optional().trim(),
    body('color').optional().trim(),
    body('parentId').optional().isUUID(),
  ],
  validate,
  categoryController.updateCategory
);

// Delete category
router.delete(
  '/:id',
  auth,
  [query('id').isUUID()],
  validate,
  categoryController.deleteCategory
);

// Get category statistics
router.get(
  '/stats/summary',
  auth,
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('type').optional().isIn(['income', 'expense', 'transfer']),
  ],
  validate,
  categoryController.getCategoryStats
);

module.exports = router; 