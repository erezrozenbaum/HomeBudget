'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Assets', {
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
        type: Sequelize.ENUM('real_estate', 'vehicle', 'jewelry', 'art', 'collectible', 'other'),
        allowNull: false
      },
      value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      purchaseDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      purchasePrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      condition: {
        type: Sequelize.ENUM('new', 'excellent', 'good', 'fair', 'poor'),
        allowNull: true
      },
      insurance: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      insuranceDetails: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      maintenanceHistory: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex('Assets', ['userId']);
    await queryInterface.addIndex('Assets', ['type']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Assets');
  }
}; 