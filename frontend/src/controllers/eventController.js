const Event = require('../models/Event');

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Researcher/Ranger/Admin only)
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      startDate,
      endDate,
      location,
      capacity,
      requirements,
      equipment
    } = req.body;

    const event = await Event.create({
      title,
      description,
      type,
      startDate,
      endDate,
      location,
      capacity,
      requirements,
      equipment,
      organizer: req.user._id,
      status: 'upcoming',
      registeredParticipants: [{
        user: req.user._id,
        status: 'registered'
      }]
    });

    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
  try {
    const { status, type } = req.query;
    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;

    const events = await Event.find(query)
      .populate('organizer', 'name email organization')
      .populate('registeredParticipants.user', 'name email organization')
      .sort({ startDate: 1 });

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Private
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email organization')
      .populate('registeredParticipants.user', 'name email organization');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update event status
// @route   PUT /api/events/:id/status
// @access  Private (Organizer/Admin only)
const updateEventStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is organizer or admin
    if (event.organizer.toString() !== req.user._id && req.user.role !== 'administrator') {
      return res.status(403).json({ message: 'Not authorized to update event status' });
    }

    event.status = status;
    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Register for event
// @route   POST /api/events/:id/register
// @access  Private
const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is full
    if (event.registeredParticipants.length >= event.capacity) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Check if user is already registered
    const isAlreadyRegistered = event.registeredParticipants.some(
      participant => participant.user.toString() === req.user._id
    );

    if (isAlreadyRegistered) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    event.registeredParticipants.push({
      user: req.user._id,
      status: 'registered'
    });

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update participant status
// @route   PUT /api/events/:id/participants/:userId
// @access  Private (Organizer/Admin only)
const updateParticipantStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is organizer or admin
    if (event.organizer.toString() !== req.user._id && req.user.role !== 'administrator') {
      return res.status(403).json({ message: 'Not authorized to update participant status' });
    }

    const participant = event.registeredParticipants.find(
      p => p.user.toString() === req.params.userId
    );

    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    participant.status = status;
    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add event impact
// @route   POST /api/events/:id/impact
// @access  Private (Organizer/Admin only)
const addEventImpact = async (req, res) => {
  try {
    const { metrics, description } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is organizer or admin
    if (event.organizer.toString() !== req.user._id && req.user.role !== 'administrator') {
      return res.status(403).json({ message: 'Not authorized to add event impact' });
    }

    event.impact = {
      metrics,
      description
    };

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's events
// @route   GET /api/events/my-events
// @access  Private
const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({
      $or: [
        { organizer: req.user._id },
        { 'registeredParticipants.user': req.user._id }
      ]
    })
      .populate('organizer', 'name email organization')
      .populate('registeredParticipants.user', 'name email organization')
      .sort({ startDate: 1 });

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEventStatus,
  registerForEvent,
  updateParticipantStatus,
  addEventImpact,
  getMyEvents
}; 