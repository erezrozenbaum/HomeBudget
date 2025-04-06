const { Model, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  class Transaction extends Model {
    static associate(models) {
      // Define associations here
      Transaction.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
      
      Transaction.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        as: 'category',
      });

      Transaction.belongsTo(models.Investment, {
        foreignKey: 'investmentId',
        as: 'investment',
      });
    }
  }

  Transaction.init(
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
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      categoryId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Categories',
          key: 'id',
        },
      },
      investmentId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Investments',
          key: 'id',
        },
      },
      merchant: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      location: {
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
      attachments: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: [],
      },
      isRecurring: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      recurringTransactionId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'RecurringTransactions',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      modelName: 'Transaction',
      tableName: 'Transactions',
      timestamps: true,
      hooks: {
        beforeCreate: (transaction) => {
          if (!transaction.id) {
            transaction.id = uuidv4();
          }
        },
      },
    }
  );

  return Transaction;
}; 