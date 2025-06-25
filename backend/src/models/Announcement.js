const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  audience: { type: String, enum: ['all', 'rangers', 'admins'], default: 'all' },
});

module.exports = mongoose.model('Announcement', announcementSchema); 