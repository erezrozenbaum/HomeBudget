'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FinancialQuestions', {
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
      question: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      category: {
        type: Sequelize.ENUM('investment', 'tax', 'retirement', 'insurance', 'debt', 'budgeting', 'other'),
        allowNull: false
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high'),
        allowNull: false,
        defaultValue: 'medium'
      },
      status: {
        type: Sequelize.ENUM('pending', 'answered', 'archived'),
        allowNull: false,
        defaultValue: 'pending'
      },
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true
      },
      context: {
        type: Sequelize.JSONB,
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

    await queryInterface.addIndex('FinancialQuestions', ['userId']);
    await queryInterface.addIndex('FinancialQuestions', ['category']);
    await queryInterface.addIndex('FinancialQuestions', ['status']);
    await queryInterface.addIndex('FinancialQuestions', ['priority']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('FinancialQuestions');
  }
}; 