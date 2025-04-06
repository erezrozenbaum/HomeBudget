'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FinancialAdvice', {
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
      questionId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'FinancialQuestions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      advice: {
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
        type: Sequelize.ENUM('draft', 'published', 'archived'),
        allowNull: false,
        defaultValue: 'draft'
      },
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true
      },
      context: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      references: {
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

    await queryInterface.addIndex('FinancialAdvice', ['userId']);
    await queryInterface.addIndex('FinancialAdvice', ['questionId']);
    await queryInterface.addIndex('FinancialAdvice', ['category']);
    await queryInterface.addIndex('FinancialAdvice', ['status']);
    await queryInterface.addIndex('FinancialAdvice', ['priority']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('FinancialAdvice');
  }
}; 