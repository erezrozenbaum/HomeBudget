const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/database')[process.env.NODE_ENV || 'development'];

// Create a Sequelize instance
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: false,
  }
);

// Define models
const User = require('../models/user')(sequelize);
const BankAccount = require('../models/bankAccount')(sequelize);
const CreditCard = require('../models/creditCard')(sequelize);
const Transaction = require('../models/transaction')(sequelize);
const Category = require('../models/category')(sequelize);
const RecurringTransaction = require('../models/recurringTransaction')(sequelize);

// Define associations
User.associate(sequelize.models);
BankAccount.associate(sequelize.models);
CreditCard.associate(sequelize.models);
Transaction.associate(sequelize.models);
Category.associate(sequelize.models);
RecurringTransaction.associate(sequelize.models);

// Generate migrations directory if it doesn't exist
const migrationsDir = path.join(__dirname, '..', 'migrations');
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

// Generate migration files
const generateMigration = async () => {
  try {
    // Get all models
    const models = [
      { name: 'Users', model: User },
      { name: 'BankAccounts', model: BankAccount },
      { name: 'CreditCards', model: CreditCard },
      { name: 'Transactions', model: Transaction },
      { name: 'Categories', model: Category },
      { name: 'RecurringTransactions', model: RecurringTransaction },
    ];

    // Generate migration for each model
    for (const { name, model } of models) {
      const tableName = model.tableName;
      const attributes = model.rawAttributes;
      
      // Create migration content
      const migrationContent = `'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('${tableName}', {
      ${Object.entries(attributes)
        .map(([key, attr]) => {
          let attrStr = `${key}: {`;
          
          // Type
          if (attr.type instanceof Sequelize.DataTypes.ENUM) {
            attrStr += `\n        type: Sequelize.ENUM(${attr.type.values.map(v => `'${v}'`).join(', ')}),`;
          } else if (attr.type instanceof Sequelize.DataTypes.DECIMAL) {
            attrStr += `\n        type: Sequelize.DECIMAL(${attr.type.precision}, ${attr.type.scale}),`;
          } else if (attr.type instanceof Sequelize.DataTypes.STRING) {
            if (attr.type._length) {
              attrStr += `\n        type: Sequelize.STRING(${attr.type._length}),`;
            } else {
              attrStr += `\n        type: Sequelize.STRING,`;
            }
          } else if (attr.type instanceof Sequelize.DataTypes.TEXT) {
            attrStr += `\n        type: Sequelize.TEXT,`;
          } else if (attr.type instanceof Sequelize.DataTypes.BOOLEAN) {
            attrStr += `\n        type: Sequelize.BOOLEAN,`;
          } else if (attr.type instanceof Sequelize.DataTypes.INTEGER) {
            attrStr += `\n        type: Sequelize.INTEGER,`;
          } else if (attr.type instanceof Sequelize.DataTypes.DATE) {
            attrStr += `\n        type: Sequelize.DATE,`;
          } else if (attr.type instanceof Sequelize.DataTypes.UUID) {
            attrStr += `\n        type: Sequelize.UUID,`;
          } else if (attr.type instanceof Sequelize.DataTypes.ARRAY) {
            attrStr += `\n        type: Sequelize.ARRAY(Sequelize.${attr.type.type.key}),`;
          } else if (attr.type instanceof Sequelize.DataTypes.JSONB) {
            attrStr += `\n        type: Sequelize.JSONB,`;
          } else {
            attrStr += `\n        type: Sequelize.${attr.type.key},`;
          }
          
          // Allow null
          attrStr += `\n        allowNull: ${attr.allowNull},`;
          
          // Default value
          if (attr.defaultValue !== undefined) {
            if (typeof attr.defaultValue === 'string') {
              attrStr += `\n        defaultValue: '${attr.defaultValue}',`;
            } else if (typeof attr.defaultValue === 'boolean') {
              attrStr += `\n        defaultValue: ${attr.defaultValue},`;
            } else if (typeof attr.defaultValue === 'number') {
              attrStr += `\n        defaultValue: ${attr.defaultValue},`;
            } else if (attr.defaultValue === null) {
              attrStr += `\n        defaultValue: null,`;
            } else if (attr.defaultValue instanceof Date) {
              attrStr += `\n        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),`;
            } else if (typeof attr.defaultValue === 'object') {
              attrStr += `\n        defaultValue: ${JSON.stringify(attr.defaultValue)},`;
            } else if (attr.defaultValue === Sequelize.UUIDV4) {
              attrStr += `\n        defaultValue: Sequelize.UUIDV4,`;
            } else if (attr.defaultValue === Sequelize.NOW) {
              attrStr += `\n        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),`;
            }
          }
          
          // Primary key
          if (attr.primaryKey) {
            attrStr += `\n        primaryKey: true,`;
          }
          
          // Unique
          if (attr.unique) {
            attrStr += `\n        unique: true,`;
          }
          
          // References
          if (attr.references) {
            attrStr += `\n        references: {`;
            attrStr += `\n          model: '${attr.references.model}',`;
            attrStr += `\n          key: '${attr.references.key}',`;
            attrStr += `\n        },`;
          }
          
          attrStr += `\n      }`;
          return attrStr;
        })
        .join(',\n      ')},
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('${tableName}');
  }
};
`;

      // Write migration file
      const timestamp = new Date().toISOString().replace(/[-T:]/g, '').split('.')[0];
      const migrationFileName = `${timestamp}-create-${tableName.toLowerCase()}.js`;
      const migrationFilePath = path.join(migrationsDir, migrationFileName);
      
      fs.writeFileSync(migrationFilePath, migrationContent);
      console.log(`Generated migration: ${migrationFileName}`);
    }

    console.log('All migrations generated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error generating migrations:', error);
    process.exit(1);
  }
};

// Run the script
generateMigration(); 