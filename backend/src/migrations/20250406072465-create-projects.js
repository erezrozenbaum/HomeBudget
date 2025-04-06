'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Projects', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      businessId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Businesses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      clientId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'BusinessClients',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('planning', 'in_progress', 'on_hold', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'planning'
      },
      budget: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      actualCost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high'),
        allowNull: false,
        defaultValue: 'medium'
      },
      team: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      milestones: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      documents: {
        type: Sequelize.JSONB,
        allowNull: true
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

    await queryInterface.addIndex('Projects', ['businessId']);
    await queryInterface.addIndex('Projects', ['clientId']);
    await queryInterface.addIndex('Projects', ['status']);
    await queryInterface.addIndex('Projects', ['startDate']);
    await queryInterface.addIndex('Projects', ['endDate']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Projects');
  }
}; 