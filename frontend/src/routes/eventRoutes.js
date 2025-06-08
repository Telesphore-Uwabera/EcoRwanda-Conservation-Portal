const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEventById,
  updateEventStatus,
  registerForEvent,
  updateParticipantStatus,
  addEventImpact,
  getMyEvents
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Routes accessible by all authenticated users
router.get('/', getEvents);
router.get('/my-events', getMyEvents);
router.get('/:id', getEventById);
router.post('/:id/register', registerForEvent);

// Routes accessible only by researchers, rangers, and administrators
router.post('/', authorize('researcher', 'ranger', 'administrator'), createEvent);
router.put('/:id/status', authorize('researcher', 'ranger', 'administrator'), updateEventStatus);
router.put('/:id/participants/:userId', authorize('researcher', 'ranger', 'administrator'), updateParticipantStatus);
router.post('/:id/impact', authorize('researcher', 'ranger', 'administrator'), addEventImpact);

module.exports = router; 