const mongoose = require('mongoose');

const PatrolSchema = new mongoose.Schema({
  route: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['in_progress', 'scheduled', 'completed', 'cancelled'],
    default: 'scheduled',
  },
  duration: {
    type: String, // e.g., "2 hours", "45 minutes"
    trim: true,
  },
  findings: {
    type: String,
    trim: true,
  },
  ranger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  patrolDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Patrol', PatrolSchema); 