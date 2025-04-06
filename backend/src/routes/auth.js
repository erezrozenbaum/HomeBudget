const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth');
const validate = require('../middleware/validate');
const seedSampleData = require('../scripts/seedSampleData');
const auth = require('../middleware/auth');

// Register route
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
  ],
  validate,
  authController.register
);

// Login route
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validate,
  authController.login
);

// Password reset request route
router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail()],
  validate,
  authController.forgotPassword
);

// Password reset route
router.post(
  '/reset-password',
  [
    body('token').notEmpty(),
    body('password').isLength({ min: 6 }),
  ],
  validate,
  authController.resetPassword
);

// Get current user route
router.get('/me', auth, authController.getCurrentUser);

// Seed sample data route (protected)
router.post('/seed-sample-data', auth, authController.seedSampleData);

module.exports = router; 