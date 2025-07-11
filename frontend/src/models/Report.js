const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    name: {
      type: String,
      required: true
    },
    coordinates: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    }
  },
  category: {
    type: String,
    enum: ['poaching', 'habitat_destruction', 'wildlife_sighting', 'human_wildlife_conflict', 'pollution', 'other'],
    required: true
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'investigating', 'resolved'],
    default: 'pending'
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  photos: [{
    url: String,
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  evidence: {
    gpsAccuracy: String,
    weatherConditions: String,
    timeOfIncident: Date
  },
  priority: {
    type: String,
    enum: ['immediate_action', 'research_value', 'monitoring'],
    required: true
  },
  updates: [{
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['verification', 'update', 'comment']
    },
    message: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report; 