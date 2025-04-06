const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { User } = require('../models');

// Get user settings
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: [
        'id',
        'email',
        'firstName',
        'lastName',
        'currency',
        'timezone',
        'theme',
        'language',
        'dashboard_widgets',
        'sidebar_collapsed',
        'sidebar_order',
        'notification_preferences',
        'security_settings'
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user settings error:', error);
    res.status(500).json({ message: 'Error fetching user settings' });
  }
});

// Update user settings
router.put('/', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update(req.body);
    res.json(user);
  } catch (error) {
    console.error('Update user settings error:', error);
    res.status(500).json({ message: 'Error updating user settings' });
  }
});

module.exports = router; 