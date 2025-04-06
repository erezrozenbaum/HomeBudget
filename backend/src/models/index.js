const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    dialectOptions: dbConfig.dialectOptions,
  }
);

// Import models
const User = require('./user')(sequelize);
const BankAccount = require('./bankAccount')(sequelize);
const CreditCard = require('./creditCard')(sequelize);
const Transaction = require('./transaction')(sequelize);
const Category = require('./category')(sequelize);
const Investment = require('./investment')(sequelize);
const Loan = require('./loan')(sequelize);
const Asset = require('./asset')(sequelize);
const RecurringTransaction = require('./recurringTransaction')(sequelize);
const Insurance = require('./insurance')(sequelize);
const InsuranceCategory = require('./insuranceCategory')(sequelize);
const Goal = require('./goal')(sequelize);
const Business = require('./business')(sequelize);
const BusinessClient = require('./businessClient')(sequelize);
const BusinessInvoice = require('./businessInvoice')(sequelize);
const Invoice = require('./invoice')(sequelize);
const Project = require('./project')(sequelize);
const FinancialQuestion = require('./financialQuestion')(sequelize);
const FinancialAdvice = require('./financialAdvice')(sequelize);
const EmergencyFund = require('./emergencyFund')(sequelize);
const UserAudit = require('./userAudit')(sequelize);

// Call associate methods for all models that have them
Object.values(sequelize.models).forEach(model => {
  if (model.associate) {
    model.associate(sequelize.models);
  }
});

// Export models
module.exports = {
  sequelize,
  User,
  BankAccount,
  CreditCard,
  Transaction,
  Category,
  Investment,
  Loan,
  Asset,
  RecurringTransaction,
  Insurance,
  InsuranceCategory,
  Goal,
  Business,
  BusinessClient,
  BusinessInvoice,
  Invoice,
  Project,
  FinancialQuestion,
  FinancialAdvice,
  EmergencyFund,
  UserAudit
}; 