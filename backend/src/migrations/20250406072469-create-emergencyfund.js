'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EmergencyFunds', {
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
      targetAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      currentAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      monthlyContribution: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      targetDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('building', 'maintaining', 'replenishing'),
        allowNull: false,
        defaultValue: 'building'
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high'),
        allowNull: false,
        defaultValue: 'high'
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

    await queryInterface.addIndex('EmergencyFunds', ['userId']);
    await queryInterface.addIndex('EmergencyFunds', ['status']);
    await queryInterface.addIndex('EmergencyFunds', ['priority']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('EmergencyFunds');
  }
}; 