const express = require('express');
const router = express.Router();
const userManagementController = require('../controllers/userManagementController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Get all users
router.get('/', authenticateToken, isAdmin, userManagementController.getUsers);

// Get user by ID
router.get('/:id', authenticateToken, isAdmin, userManagementController.getUserById);

// Update user role
router.put('/:id/role', authenticateToken, isAdmin, userManagementController.updateUserRole);

// Delete user
router.delete('/:id', authenticateToken, isAdmin, userManagementController.deleteUser);

// Register a new user by admin
router.post('/register', authenticateToken, isAdmin, userManagementController.registerUserByAdmin);

// Toggle user verification status
router.put('/:id/verify', authenticateToken, isAdmin, userManagementController.toggleUserVerification);

module.exports = router; 