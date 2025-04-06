const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator');
const { generateMonthlyReport, generateYearlyReport } = require('../scripts/generateReports');
const auth = require('../middleware/auth');

// Get monthly report
router.get('/monthly', [
  auth,
  query('year').isInt({ min: 2000, max: 2100 }),
  query('month').isInt({ min: 1, max: 12 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { year, month } = req.query;
    const report = await generateMonthlyReport(req.user.userId, parseInt(year), parseInt(month));
    res.json(report);
  } catch (error) {
    console.error('Get monthly report error:', error);
    res.status(500).json({ message: 'Error generating monthly report' });
  }
});

// Get yearly report
router.get('/yearly', [
  auth,
  query('year').isInt({ min: 2000, max: 2100 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { year } = req.query;
    const report = await generateYearlyReport(req.user.userId, parseInt(year));
    res.json(report);
  } catch (error) {
    console.error('Get yearly report error:', error);
    res.status(500).json({ message: 'Error generating yearly report' });
  }
});

module.exports = router; 