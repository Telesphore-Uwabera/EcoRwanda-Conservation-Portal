const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getDataHubData, createDataset, getDatasets, getDatasetById, updateDataset, deleteDataset, requestDatasetAccess, downloadDataset } = require('../controllers/dataHubController');

router.get('/', authenticateToken, getDataHubData);

// Dataset CRUD routes
router.post('/datasets', authenticateToken, createDataset);
router.get('/datasets', authenticateToken, getDatasets);
router.get('/datasets/:id', authenticateToken, getDatasetById);
router.put('/datasets/:id', authenticateToken, updateDataset);
router.delete('/datasets/:id', authenticateToken, deleteDataset);

router.post('/request-dataset-access', authenticateToken, requestDatasetAccess);

router.get('/datasets/:id/download', authenticateToken, downloadDataset);

module.exports = router; 