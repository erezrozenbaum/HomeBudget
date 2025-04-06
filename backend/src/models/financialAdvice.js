const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FinancialAdvice = sequelize.define('FinancialAdvice', {
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
    questionId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'FinancialQuestions',
        key: 'id'
      }
    },
    advice: {
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
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      allowNull: false,
      defaultValue: 'draft'
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    },
    context: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    references: {
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
        fields: ['questionId']
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

  return FinancialAdvice;
}; 