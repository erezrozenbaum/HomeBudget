const { Model, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  class Category extends Model {
    static associate(models) {
      // Define associations here
      Category.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
      
      Category.belongsTo(models.Category, {
        foreignKey: 'parentId',
        as: 'parent',
      });
      
      Category.hasMany(models.Category, {
        foreignKey: 'parentId',
        as: 'children',
      });
      
      Category.hasMany(models.Transaction, {
        foreignKey: 'categoryId',
        as: 'transactions',
      });
    }
  }

  Category.init(
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
      type: {
        type: DataTypes.ENUM('income', 'expense'),
        allowNull: false,
      },
      icon: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      color: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      parentId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Categories',
          key: 'id',
        },
      },
      budget: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Category',
      tableName: 'Categories',
      timestamps: true,
      hooks: {
        beforeCreate: (category) => {
          if (!category.id) {
            category.id = uuidv4();
          }
        },
      },
    }
  );

  return Category;
}; 