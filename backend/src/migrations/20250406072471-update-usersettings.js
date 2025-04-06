'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new columns to UserSettings table
    await queryInterface.addColumn('Users', 'dashboard_widgets', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: []
    });

    await queryInterface.addColumn('Users', 'sidebar_collapsed', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('Users', 'sidebar_order', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: []
    });

    await queryInterface.addColumn('Users', 'notification_preferences', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: {
        email: {
          transactions: true,
          budget: true,
          bills: true
        },
        push: {
          transactions: true,
          budget: true,
          bills: true
        }
      }
    });

    await queryInterface.addColumn('Users', 'security_settings', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: {
        twoFactor: false,
        sessionTimeout: 30
      }
    });

    await queryInterface.addColumn('Users', 'language', {
      type: Sequelize.STRING(10),
      allowNull: false,
      defaultValue: 'en'
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('Users', ['language']);
  },

  async down(queryInterface, Sequelize) {
    // Remove the columns in reverse order
    await queryInterface.removeColumn('Users', 'language');
    await queryInterface.removeColumn('Users', 'security_settings');
    await queryInterface.removeColumn('Users', 'notification_preferences');
    await queryInterface.removeColumn('Users', 'sidebar_order');
    await queryInterface.removeColumn('Users', 'sidebar_collapsed');
    await queryInterface.removeColumn('Users', 'dashboard_widgets');
  }
}; 