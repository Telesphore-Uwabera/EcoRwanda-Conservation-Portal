const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Not all system events are tied to a user
  },
  link: {
    type: String, // e.g., /admin/reports/view/123
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity; 