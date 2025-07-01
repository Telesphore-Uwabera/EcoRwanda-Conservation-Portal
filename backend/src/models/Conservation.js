const mongoose = require('mongoose');

const ConservationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['active', 'completed', 'planned'], default: 'planned' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Conservation', ConservationSchema); 