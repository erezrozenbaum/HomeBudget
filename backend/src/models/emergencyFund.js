const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EmergencyFund = sequelize.define('EmergencyFund', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    targetAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currentAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    monthlyContribution: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    targetDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('building', 'maintaining', 'replenishing'),
      allowNull: false,
      defaultValue: 'building'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: false,
      defaultValue: 'high'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['priority']
      }
    ]
  });

  return EmergencyFund;
}; 