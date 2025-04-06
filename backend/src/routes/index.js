const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const bankAccountRoutes = require('./bankAccounts');
const creditCardRoutes = require('./creditCards');
const transactionRoutes = require('./transactions');
const categoryRoutes = require('./categories');
const recurringTransactionRoutes = require('./recurringTransactions');
const reportRoutes = require('./reports');
const investmentRoutes = require('./investments');
const userSettingsRoutes = require('./userSettings');
const accountRoutes = require('./accounts');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Register routes
router.use('/auth', authRoutes);
router.use('/accounts', accountRoutes);
router.use('/bank-accounts', bankAccountRoutes);
router.use('/credit-cards', creditCardRoutes);
router.use('/transactions', transactionRoutes);
router.use('/categories', categoryRoutes);
router.use('/recurring-transactions', recurringTransactionRoutes);
router.use('/reports', reportRoutes);
router.use('/investments', investmentRoutes);
router.use('/user-settings', userSettingsRoutes);

module.exports = router; 