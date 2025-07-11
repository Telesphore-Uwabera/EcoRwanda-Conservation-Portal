const express = require('express');
const router = express.Router();
const protectedAreaController = require('../controllers/protectedAreaController');
const { authenticate } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticate);

// CRUD routes
router.post('/', protectedAreaController.createProtectedArea);
router.get('/', protectedAreaController.getAllProtectedAreas);
router.get('/nearby', protectedAreaController.getProtectedAreasNearby);
router.get('/:id', protectedAreaController.getProtectedArea);
router.put('/:id', protectedAreaController.updateProtectedArea);
router.delete('/:id', protectedAreaController.deleteProtectedArea);

// Staff management routes
router.post('/:id/staff', protectedAreaController.addStaffMember);
router.delete('/:id/staff/:userId', protectedAreaController.removeStaffMember);

// Activity and threat management routes
router.post('/:id/activities', protectedAreaController.addActivity);
router.post('/:id/threats', protectedAreaController.addThreat);

// Monitoring routes
router.post('/:id/monitoring', protectedAreaController.addMonitoringData);

module.exports = router; 