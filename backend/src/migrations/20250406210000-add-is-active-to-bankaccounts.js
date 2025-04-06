'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('BankAccounts', 'is_active', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    // Update all existing records to be active
    await queryInterface.sequelize.query(
      'UPDATE "BankAccounts" SET is_active = true WHERE is_active IS NULL'
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('BankAccounts', 'is_active');
  }
}; 