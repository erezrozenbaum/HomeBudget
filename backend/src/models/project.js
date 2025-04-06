const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Project = sequelize.define('Project', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    businessId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Businesses',
        key: 'id'
      }
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'BusinessClients',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
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
      type: DataTypes.ENUM('planning', 'in_progress', 'on_hold', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'planning'
    },
    budget: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    actualCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: false,
      defaultValue: 'medium'
    },
    team: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    milestones: {
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
        fields: ['businessId']
      },
      {
        fields: ['clientId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['startDate']
      },
      {
        fields: ['endDate']
      }
    ]
  });

  return Project;
}; 