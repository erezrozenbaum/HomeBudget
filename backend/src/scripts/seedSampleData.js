const { Transaction, Category, BankAccount, CreditCard, EmergencyFund } = require('../models');

async function seedSampleData(userId) {
  try {
    // Create a bank account
    const checkingAccount = await BankAccount.create({
      userId,
      name: 'Main Checking',
      balance: 5000.00,
      type: 'checking',
      accountNumber: 'XXXX1234',
      bankName: 'Sample Bank',
      currency: 'USD',
      color: '#4CAF50'
    });

    // Create a credit card
    const creditCard = await CreditCard.create({
      userId,
      name: 'Main Credit Card',
      currentBalance: 0,
      creditLimit: 5000.00,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      minimumPayment: 35.00,
      apr: 15.99,
      cardNumber: 'XXXX5678',
      issuer: 'Visa',
      availableCredit: 5000.00,
      statementDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      currency: 'USD',
      color: '#F44336'
    });

    // Create an emergency fund
    const emergencyFund = await EmergencyFund.create({
      userId,
      name: 'Emergency Fund',
      balance: 10000.00,
      targetAmount: 15000.00,
      monthlyContribution: 500.00,
      currency: 'USD',
      color: '#2196F3'
    });

    // Get default categories
    const categories = await Category.findAll({
      where: { userId }
    });

    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.name] = cat;
      return acc;
    }, {});

    // Create sample transactions
    const transactions = [
      {
        userId,
        amount: 3000.00,
        type: 'income',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        description: 'Monthly Salary',
        categoryId: categoryMap['Salary'].id,
        accountId: checkingAccount.id,
        accountType: 'bankAccount'
      },
      {
        userId,
        amount: -1200.00,
        type: 'expense',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        description: 'Rent Payment',
        categoryId: categoryMap['Housing'].id,
        accountId: checkingAccount.id,
        accountType: 'bankAccount'
      },
      {
        userId,
        amount: -85.50,
        type: 'expense',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        description: 'Grocery Shopping',
        categoryId: categoryMap['Food'].id,
        accountId: creditCard.id,
        accountType: 'creditCard'
      },
      {
        userId,
        amount: -500.00,
        type: 'transfer',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        description: 'Emergency Fund Contribution',
        categoryId: categoryMap['Savings'].id,
        accountId: emergencyFund.id,
        accountType: 'emergencyFund'
      }
    ];

    await Promise.all(transactions.map(transaction => 
      Transaction.create(transaction)
    ));

    console.log('Sample data seeded successfully for user:', userId);
    return true;
  } catch (error) {
    console.error('Error seeding sample data:', error);
    throw error;
  }
}

module.exports = seedSampleData; 