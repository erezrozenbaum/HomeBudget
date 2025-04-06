'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('InsuranceCategories', {
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
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      type: {
        type: Sequelize.ENUM('life', 'health', 'auto', 'home', 'disability', 'other'),
        allowNull: false
      },
      color: {
        type: Sequelize.STRING(7),
        allowNull: true
      },
      icon: {
        type: Sequelize.STRING,
        allowNull: true
      },
      isDefault: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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

    await queryInterface.addIndex('InsuranceCategories', ['userId']);
    await queryInterface.addIndex('InsuranceCategories', ['type']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('InsuranceCategories');
  }
}; 