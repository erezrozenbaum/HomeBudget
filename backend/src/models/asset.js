const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Asset = sequelize.define('Asset', {
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
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('real_estate', 'vehicle', 'jewelry', 'art', 'collectible', 'other'),
      allowNull: false
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    purchaseDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    purchasePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    condition: {
      type: DataTypes.ENUM('new', 'excellent', 'good', 'fair', 'poor'),
      allowNull: true
    },
    insurance: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    insuranceDetails: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    maintenanceHistory: {
      type: DataTypes.TEXT,
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
        fields: ['type']
      }
    ]
  });

  return Asset;
}; 