const { Model, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  class CreditCard extends Model {
    static associate(models) {
      // Define associations here
      CreditCard.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
    }
  }

  CreditCard.init(
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
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      issuer: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      creditLimit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      currentBalance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      availableCredit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      statementDate: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 31,
        },
      },
      dueDate: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 31,
        },
      },
      interestRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      annualFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      rewardsProgram: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      cardNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      expirationDate: {
        type: DataTypes.STRING,
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
    },
    {
      sequelize,
      modelName: 'CreditCard',
      tableName: 'CreditCards',
      timestamps: true,
      hooks: {
        beforeCreate: (card) => {
          if (!card.id) {
            card.id = uuidv4();
          }
        },
        beforeSave: (card) => {
          // Update available credit whenever current balance changes
          card.availableCredit = card.creditLimit - card.currentBalance;
        },
      },
    }
  );

  return CreditCard;
}; 