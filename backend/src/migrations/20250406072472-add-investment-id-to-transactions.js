'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Transactions', 'investmentId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Investments',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Add index for better query performance
    await queryInterface.addIndex('Transactions', ['investmentId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Transactions', 'investmentId');
  }
}; 