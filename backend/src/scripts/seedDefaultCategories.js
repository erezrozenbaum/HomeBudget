const { Category } = require('../models');

const defaultCategories = [
  // Income categories
  {
    name: 'Salary',
    type: 'income',
    icon: 'money-bill',
    color: '#4CAF50',
    isDefault: true,
  },
  {
    name: 'Freelance',
    type: 'income',
    icon: 'laptop',
    color: '#2196F3',
    isDefault: true,
  },
  {
    name: 'Investments',
    type: 'income',
    icon: 'chart-line',
    color: '#9C27B0',
    isDefault: true,
  },
  {
    name: 'Gifts',
    type: 'income',
    icon: 'gift',
    color: '#E91E63',
    isDefault: true,
  },
  {
    name: 'Other Income',
    type: 'income',
    icon: 'plus-circle',
    color: '#00BCD4',
    isDefault: true,
  },

  // Expense categories
  {
    name: 'Housing',
    type: 'expense',
    icon: 'home',
    color: '#795548',
    isDefault: true,
  },
  {
    name: 'Transportation',
    type: 'expense',
    icon: 'car',
    color: '#607D8B',
    isDefault: true,
  },
  {
    name: 'Food',
    type: 'expense',
    icon: 'utensils',
    color: '#FF9800',
    isDefault: true,
  },
  {
    name: 'Utilities',
    type: 'expense',
    icon: 'bolt',
    color: '#FFC107',
    isDefault: true,
  },
  {
    name: 'Insurance',
    type: 'expense',
    icon: 'shield-alt',
    color: '#3F51B5',
    isDefault: true,
  },
  {
    name: 'Healthcare',
    type: 'expense',
    icon: 'medkit',
    color: '#F44336',
    isDefault: true,
  },
  {
    name: 'Entertainment',
    type: 'expense',
    icon: 'film',
    color: '#9C27B0',
    isDefault: true,
  },
  {
    name: 'Shopping',
    type: 'expense',
    icon: 'shopping-cart',
    color: '#E91E63',
    isDefault: true,
  },
  {
    name: 'Education',
    type: 'expense',
    icon: 'graduation-cap',
    color: '#2196F3',
    isDefault: true,
  },
  {
    name: 'Personal Care',
    type: 'expense',
    icon: 'spa',
    color: '#009688',
    isDefault: true,
  },
  {
    name: 'Travel',
    type: 'expense',
    icon: 'plane',
    color: '#673AB7',
    isDefault: true,
  },
  {
    name: 'Debt Payments',
    type: 'expense',
    icon: 'credit-card',
    color: '#FF5722',
    isDefault: true,
  },
  {
    name: 'Savings',
    type: 'expense',
    icon: 'piggy-bank',
    color: '#4CAF50',
    isDefault: true,
  },
  {
    name: 'Gifts & Donations',
    type: 'expense',
    icon: 'gift',
    color: '#00BCD4',
    isDefault: true,
  },
  {
    name: 'Other Expenses',
    type: 'expense',
    icon: 'ellipsis-h',
    color: '#9E9E9E',
    isDefault: true,
  },
];

async function seedDefaultCategories(userId) {
  try {
    // Check if user already has default categories
    const existingCategories = await Category.findAll({
      where: {
        userId,
        isDefault: true,
      },
    });

    if (existingCategories.length > 0) {
      console.log('Default categories already exist for user:', userId);
      return;
    }

    // Create default categories for the user
    const categories = await Promise.all(
      defaultCategories.map(category =>
        Category.create({
          ...category,
          userId,
        })
      )
    );

    console.log(`Created ${categories.length} default categories for user:`, userId);
    return categories;
  } catch (error) {
    console.error('Error seeding default categories:', error);
    throw error;
  }
}

module.exports = seedDefaultCategories; 