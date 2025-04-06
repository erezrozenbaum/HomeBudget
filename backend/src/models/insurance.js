const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Insurance = sequelize.define('Insurance', {
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
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'InsuranceCategories',
        key: 'id'
      }
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: false
    },
    policyNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('life', 'health', 'auto', 'home', 'disability', 'other'),
      allowNull: false
    },
    coverage: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    premium: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    frequency: {
      type: DataTypes.ENUM('monthly', 'quarterly', 'annually'),
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'expired', 'cancelled'),
      allowNull: false,
      defaultValue: 'active'
    },
    beneficiaries: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    documents: {
      type: DataTypes.JSONB,
      allowNull: true
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
        fields: ['categoryId']
      },
      {
        fields: ['type']
      },
      {
        fields: ['status']
      }
    ]
  });

  return Insurance;
}; 