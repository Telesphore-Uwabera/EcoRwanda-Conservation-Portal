const mongoose = require('mongoose');

const ConservationProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  organization: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  volunteers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  impact: {
    treesPlanted: { type: Number, default: 0 },
    wildlifeProtected: { type: Number, default: 0 },
    areaRestored: { type: Number, default: 0 },
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'planning'],
    default: 'planning',
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ConservationProject', ConservationProjectSchema); 