'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Insurances', {
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
      categoryId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'InsuranceCategories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      provider: {
        type: Sequelize.STRING,
        allowNull: false
      },
      policyNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('life', 'health', 'auto', 'home', 'disability', 'other'),
        allowNull: false
      },
      coverage: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      premium: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      frequency: {
        type: Sequelize.ENUM('monthly', 'quarterly', 'annually'),
        allowNull: false
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
        type: Sequelize.ENUM('active', 'expired', 'cancelled'),
        allowNull: false,
        defaultValue: 'active'
      },
      beneficiaries: {
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

    await queryInterface.addIndex('Insurances', ['userId']);
    await queryInterface.addIndex('Insurances', ['categoryId']);
    await queryInterface.addIndex('Insurances', ['type']);
    await queryInterface.addIndex('Insurances', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Insurances');
  }
}; 