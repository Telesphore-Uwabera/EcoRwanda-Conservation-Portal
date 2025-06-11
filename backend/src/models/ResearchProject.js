const mongoose = require('mongoose');

const ResearchProjectSchema = new mongoose.Schema({
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
  leadResearcher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  organization: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'data_collection', 'analysis', 'completed'],
    default: 'planning',
  },
  volunteers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  requiredSkills: [
    { type: String, trim: true }
  ],
  location: {
    type: String,
    trim: true,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  findings: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ResearchProject', ResearchProjectSchema); 