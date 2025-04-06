const { Model, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      // Define associations here
      User.hasMany(models.BankAccount, {
        foreignKey: 'userId',
        as: 'bankAccounts',
      });
      
      User.hasMany(models.CreditCard, {
        foreignKey: 'userId',
        as: 'creditCards',
      });
      
      User.hasMany(models.Transaction, {
        foreignKey: 'userId',
        as: 'transactions',
      });
      
      User.hasMany(models.Category, {
        foreignKey: 'userId',
        as: 'categories',
      });
      
      User.hasMany(models.RecurringTransaction, {
        foreignKey: 'userId',
        as: 'recurringTransactions',
      });
    }
    
    // Instance method to validate password
    async validatePassword(password) {
      return bcrypt.compare(password, this.password);
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'USD',
      },
      timezone: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'UTC',
      },
      theme: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'light',
      },
      language: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'en',
      },
      dashboard_widgets: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
      },
      sidebar_collapsed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      sidebar_order: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
      },
      notification_preferences: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {
          email: {
            transactions: true,
            budget: true,
            bills: true,
          },
          push: {
            transactions: true,
            budget: true,
            bills: true,
          },
        },
      },
      security_settings: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {
          twoFactor: false,
          sessionTimeout: 30,
        },
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'Users',
      timestamps: true,
      hooks: {
        beforeCreate: async (user) => {
          if (!user.id) {
            user.id = uuidv4();
          }
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    }
  );

  return User;
}; 