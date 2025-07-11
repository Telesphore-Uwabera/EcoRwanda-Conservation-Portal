const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working' });
});

// Register route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// Forgot Password route
router.post('/forgot-password', authController.forgotPassword);

// Reset Password route
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router; 