const mongoose = require('mongoose');

const ResearcherSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Add other researcher-specific fields here
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Researcher', ResearcherSchema); 