const mongoose = require('mongoose');

const patrolSchema = new mongoose.Schema({
  route: {
    type: String,
    required: true
  },
  patrolDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  estimatedDuration: {
    type: Number, // Duration in hours
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  objectives: [{
    type: String
  }],
  equipment: [{
    type: String
  }],
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  ranger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  findings: {
    type: String
  },
  actualDuration: {
    type: Number // Actual duration in hours
  },
  endTime: {
    type: Date
  },
  attendees: [
    {
      name: { type: String, required: true },
      phone: { 
        type: String, 
        required: true,
        validate: {
          validator: function(v) {
            return /^\d{10}$/.test(v);
          },
          message: props => `${props.value} is not a valid 10-digit phone number!`
        }
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Patrol', patrolSchema); 