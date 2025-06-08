const mongoose = require('mongoose');

const RangerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Add other ranger-specific fields here
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Ranger', RangerSchema); 