const { Category, Transaction } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const { type } = req.query;
    const where = { userId: req.user.userId };
    
    if (type) {
      where.type = type;
    }

    const categories = await Category.findAll({
      where,
      order: [['name', 'ASC']],
    });

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
};

// Get category by ID
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Error fetching category' });
  }
};

// Create new category
exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create({
      userId: req.user.userId,
      ...req.body,
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Error creating category' });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.update(req.body);

    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Error updating category' });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has child categories
    const hasChildren = await Category.findOne({
      where: {
        parentId: category.id,
        userId: req.user.userId,
      },
    });

    if (hasChildren) {
      return res.status(400).json({
        message: 'Cannot delete category with child categories. Please delete or reassign child categories first.',
      });
    }

    // Check if category has transactions
    const transactionCount = await Transaction.count({
      where: {
        categoryId: category.id,
      },
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete category with existing transactions',
      });
    }

    await category.destroy();

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Error deleting category' });
  }
};

// Get category statistics
exports.getCategoryStats = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    
    // Build where clause
    const where = { userId: req.user.userId };

    if (startDate && endDate) {
      where.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else if (startDate) {
      where.date = {
        [Op.gte]: new Date(startDate),
      };
    } else if (endDate) {
      where.date = {
        [Op.lte]: new Date(endDate),
      };
    }

    if (type) {
      where.type = type;
    }

    // Get category statistics
    const categoryStats = await Transaction.findAll({
      where,
      attributes: [
        'categoryId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
      ],
      include: [
        {
          model: Category,
          attributes: ['name', 'type', 'icon', 'color'],
        },
      ],
      group: ['categoryId', 'Category.id'],
      order: [[sequelize.literal('total'), 'DESC']],
      raw: true,
      nest: true,
    });

    // Format the response
    const stats = categoryStats.map(stat => ({
      name: stat.Category.name,
      type: stat.Category.type,
      icon: stat.Category.icon,
      color: stat.Category.color,
      count: parseInt(stat.count),
      total: parseFloat(stat.total || 0),
    }));

    res.json(stats);
  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json({ message: 'Error fetching category statistics' });
  }
}; 