const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FinancialQuestion = sequelize.define('FinancialQuestion', {
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
    question: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('investment', 'tax', 'retirement', 'insurance', 'debt', 'budgeting', 'other'),
      allowNull: false
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: false,
      defaultValue: 'medium'
    },
    status: {
      type: DataTypes.ENUM('pending', 'answered', 'archived'),
      allowNull: false,
      defaultValue: 'pending'
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    },
    context: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['category']
      },
      {
        fields: ['status']
      },
      {
        fields: ['priority']
      }
    ]
  });

  return FinancialQuestion;
}; 