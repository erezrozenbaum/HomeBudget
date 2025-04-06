const { Model, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  class Investment extends Model {
    static associate(models) {
      // Define associations here
      Investment.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
      Investment.hasMany(models.Transaction, {
        foreignKey: 'investmentId',
        as: 'transactions',
      });
    }
  }

  Investment.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('stock', 'bond', 'mutual_fund', 'etf', 'crypto', 'real_estate', 'other'),
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'USD',
      },
      institution: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      accountNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      purchaseDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      currentValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      returnRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      riskLevel: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      lastUpdated: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Investment',
      tableName: 'Investments',
      hooks: {
        beforeCreate: (investment) => {
          if (!investment.id) {
            investment.id = uuidv4();
          }
        },
      },
    }
  );

  return Investment;
}; 