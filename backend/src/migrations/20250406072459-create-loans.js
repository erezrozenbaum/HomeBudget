'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Loans', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('mortgage', 'auto', 'personal', 'student', 'business', 'other'),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      interestRate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false
      },
      term: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Term in months'
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      monthlyPayment: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      remainingBalance: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      lender: {
        type: Sequelize.STRING,
        allowNull: true
      },
      accountNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'paid', 'defaulted', 'refinanced'),
        allowNull: false,
        defaultValue: 'active'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('Loans', ['userId']);
    await queryInterface.addIndex('Loans', ['type']);
    await queryInterface.addIndex('Loans', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Loans');
  }
}; 