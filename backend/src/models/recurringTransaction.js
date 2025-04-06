const { Model, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  class RecurringTransaction extends Model {
    static associate(models) {
      // Define associations here
      RecurringTransaction.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
      
      RecurringTransaction.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        as: 'category',
      });
      
      RecurringTransaction.hasMany(models.Transaction, {
        foreignKey: 'recurringTransactionId',
        as: 'transactions',
      });
    }
  }

  RecurringTransaction.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      accountId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      accountType: {
        type: DataTypes.ENUM('bank', 'credit'),
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0.01,
        },
      },
      type: {
        type: DataTypes.ENUM('income', 'expense', 'transfer'),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      frequency: {
        type: DataTypes.ENUM('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annually'),
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      lastProcessedDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      nextProcessDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      categoryId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Categories',
          key: 'id',
        },
      },
      merchant: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: [],
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'RecurringTransaction',
      tableName: 'RecurringTransactions',
      timestamps: true,
      hooks: {
        beforeCreate: (recurringTransaction) => {
          if (!recurringTransaction.id) {
            recurringTransaction.id = uuidv4();
          }
        },
      },
    }
  );

  return RecurringTransaction;
}; 