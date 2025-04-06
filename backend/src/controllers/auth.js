const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Transaction, BankAccount, Category } = require('../models');
const seedDefaultCategories = require('../scripts/seedDefaultCategories');
const { Op } = require('sequelize');
const { subDays, addDays, subMonths } = require('date-fns');

// Register user
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user exists
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      currency: 'USD',
      timezone: 'UTC',
      theme: 'light',
      language: 'en',
      dashboard_widgets: [],
      sidebar_collapsed: false,
      sidebar_order: [],
      notification_preferences: {
        email: { transactions: true, budget: true, bills: true },
        push: { transactions: true, budget: true, bills: true }
      },
      security_settings: {
        twoFactor: false,
        sessionTimeout: 30
      }
    });

    // Seed default categories for the new user
    await seedDefaultCategories(user.id);

    // Create token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        currency: user.currency,
        timezone: user.timezone,
        theme: user.theme
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Update last login
    await user.update({ lastLogin: new Date() });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        currency: user.currency,
        timezone: user.timezone,
        theme: user.theme
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Save reset token and expiry
    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour
    });

    // TODO: Send email with reset link
    // For now, just return the token
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error processing request' });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    await user.update({
      password,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: ['id', 'email', 'firstName', 'lastName', 'currency', 'timezone', 'theme']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Error getting current user' });
  }
};

// Seed sample data
exports.seedSampleData = async (req, res) => {
  try {
    const userId = req.user.userId;
    const now = new Date();

    // Create sample bank accounts
    const checkingAccount = await BankAccount.create({
      userId,
      name: 'Main Checking',
      type: 'checking',
      balance: 5000,
      currency: 'USD',
      institution: 'Sample Bank',
      accountNumber: '****1234',
      notes: 'Primary checking account',
      isActive: true,
      lastUpdated: now
    });

    const savingsAccount = await BankAccount.create({
      userId,
      name: 'Savings',
      type: 'savings',
      balance: 10000,
      currency: 'USD',
      institution: 'Sample Bank',
      accountNumber: '****5678',
      notes: 'Emergency fund',
      isActive: true,
      lastUpdated: now
    });

    // Get categories
    const categories = await Category.findAll({
      where: { userId }
    });

    // Create sample transactions
    const sampleTransactions = [];
    
    // Last 3 months of transactions
    for (let i = 90; i >= 0; i--) {
      const date = subDays(now, i);
      
      // Random income transactions
      if (i % 15 === 0) { // Bi-weekly salary
        sampleTransactions.push({
          userId,
          accountId: checkingAccount.id,
          accountType: 'bank',
          amount: 3000,
          type: 'income',
          description: 'Salary deposit',
          date,
          categoryId: categories.find(c => c.name === 'Salary')?.id,
          merchant: 'Employer Inc.',
          status: 'completed'
        });
      }

      // Random expense transactions
      if (i % 3 === 0) { // Every 3 days
        const randomCategory = categories.find(c => c.type === 'expense');
        sampleTransactions.push({
          userId,
          accountId: checkingAccount.id,
          accountType: 'bank',
          amount: Math.floor(Math.random() * 100) + 20,
          type: 'expense',
          description: 'Groceries and supplies',
          date,
          categoryId: randomCategory?.id,
          merchant: 'Local Market',
          status: 'completed'
        });
      }

      // Random savings transfer
      if (i % 30 === 0) { // Monthly savings
        sampleTransactions.push({
          userId,
          accountId: savingsAccount.id,
          accountType: 'bank',
          amount: 500,
          type: 'transfer',
          description: 'Monthly savings transfer',
          date,
          categoryId: categories.find(c => c.name === 'Savings')?.id,
          status: 'completed'
        });
      }
    }

    await Transaction.bulkCreate(sampleTransactions);

    res.json({ message: 'Sample data created successfully' });
  } catch (error) {
    console.error('Seed sample data error:', error);
    res.status(500).json({ message: 'Error creating sample data' });
  }
}; 