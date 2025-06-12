const express = require('express');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const systemSettingsController = require('../controllers/systemSettingsController');

const router = express.Router();

// Admin-only routes for system settings
router.get(
  '/admin/settings',
  authenticateToken,
  isAdmin,
  systemSettingsController.getSystemSettings
);

router.put(
  '/admin/settings',
  authenticateToken,
  isAdmin,
  systemSettingsController.updateSystemSettings
);

module.exports = router; 