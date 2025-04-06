const { Investment, Transaction } = require('../models');
const { Op } = require('sequelize');

// Get all investments
exports.getInvestments = async (req, res) => {
  try {
    const { type, riskLevel } = req.query;
    const where = { userId: req.user.id };

    if (type) {
      where.type = type;
    }

    if (riskLevel) {
      where.riskLevel = riskLevel;
    }

    const investments = await Investment.findAll({
      where,
      order: [['name', 'ASC']],
    });

    res.json(investments);
  } catch (error) {
    console.error('Get investments error:', error);
    res.status(500).json({ message: 'Error fetching investments' });
  }
};

// Get investment by ID
exports.getInvestment = async (req, res) => {
  try {
    const investment = await Investment.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: [
        {
          model: Transaction,
          as: 'transactions',
          attributes: ['id', 'amount', 'type', 'date', 'description'],
        },
      ],
    });

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    res.json(investment);
  } catch (error) {
    console.error('Get investment error:', error);
    res.status(500).json({ message: 'Error fetching investment' });
  }
};

// Create new investment
exports.createInvestment = async (req, res) => {
  try {
    const {
      name,
      type,
      amount,
      currency,
      institution,
      accountNumber,
      purchaseDate,
      currentValue,
      returnRate,
      riskLevel,
      notes,
    } = req.body;

    const investment = await Investment.create({
      userId: req.user.id,
      name,
      type,
      amount,
      currency,
      institution,
      accountNumber,
      purchaseDate,
      currentValue,
      returnRate,
      riskLevel,
      notes,
    });

    res.status(201).json(investment);
  } catch (error) {
    console.error('Create investment error:', error);
    res.status(500).json({ message: 'Error creating investment' });
  }
};

// Update investment
exports.updateInvestment = async (req, res) => {
  try {
    const investment = await Investment.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    await investment.update(req.body);
    res.json(investment);
  } catch (error) {
    console.error('Update investment error:', error);
    res.status(500).json({ message: 'Error updating investment' });
  }
};

// Delete investment
exports.deleteInvestment = async (req, res) => {
  try {
    const investment = await Investment.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    // Check if investment has transactions
    const transactionCount = await Transaction.count({
      where: {
        investmentId: investment.id,
      },
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete investment with existing transactions',
      });
    }

    await investment.destroy();
    res.json({ message: 'Investment deleted successfully' });
  } catch (error) {
    console.error('Delete investment error:', error);
    res.status(500).json({ message: 'Error deleting investment' });
  }
};

// Get investment statistics
exports.getInvestmentStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build where clause
    const where = { userId: req.user.id };

    if (startDate && endDate) {
      where.purchaseDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else if (startDate) {
      where.purchaseDate = {
        [Op.gte]: new Date(startDate),
      };
    } else if (endDate) {
      where.purchaseDate = {
        [Op.lte]: new Date(endDate),
      };
    }

    // Get investment statistics by type
    const typeStats = await Investment.findAll({
      where,
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
        [sequelize.fn('SUM', sequelize.col('currentValue')), 'totalValue'],
      ],
      group: ['type'],
      raw: true,
    });

    // Get investment statistics by risk level
    const riskStats = await Investment.findAll({
      where,
      attributes: [
        'riskLevel',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
        [sequelize.fn('SUM', sequelize.col('currentValue')), 'totalValue'],
      ],
      group: ['riskLevel'],
      raw: true,
    });

    // Calculate total return
    const totalStats = await Investment.findAll({
      where,
      attributes: [
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
        [sequelize.fn('SUM', sequelize.col('currentValue')), 'totalValue'],
      ],
      raw: true,
    });

    const totalAmount = parseFloat(totalStats[0]?.totalAmount || 0);
    const totalValue = parseFloat(totalStats[0]?.totalValue || 0);
    const totalReturn = totalValue - totalAmount;
    const returnPercentage = totalAmount > 0 ? (totalReturn / totalAmount) * 100 : 0;

    // Format the response
    const stats = {
      byType: typeStats.map(stat => ({
        type: stat.type,
        count: parseInt(stat.count),
        totalAmount: parseFloat(stat.totalAmount || 0),
        totalValue: parseFloat(stat.totalValue || 0),
      })),
      byRiskLevel: riskStats.map(stat => ({
        riskLevel: stat.riskLevel,
        count: parseInt(stat.count),
        totalAmount: parseFloat(stat.totalAmount || 0),
        totalValue: parseFloat(stat.totalValue || 0),
      })),
      summary: {
        totalAmount,
        totalValue,
        totalReturn,
        returnPercentage: parseFloat(returnPercentage.toFixed(2)),
      },
    };

    res.json(stats);
  } catch (error) {
    console.error('Get investment stats error:', error);
    res.status(500).json({ message: 'Error fetching investment statistics' });
  }
}; 