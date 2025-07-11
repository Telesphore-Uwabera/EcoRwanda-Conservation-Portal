const Announcement = require('../models/Announcement');

// Get all announcements (filter by audience)
exports.getAnnouncements = async (req, res) => {
  try {
    const userRole = req.user.role;
    let filter = { $or: [{ audience: 'all' }] };
    if (userRole === 'ranger') filter.$or.push({ audience: 'rangers' });
    if (userRole === 'administrator') filter.$or.push({ audience: 'admins' });
    const announcements = await Announcement.find(filter).sort({ createdAt: -1 }).populate('createdBy', 'firstName lastName');
    res.json({ success: true, announcements });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Create announcement (admin only)
exports.createAnnouncement = async (req, res) => {
  try {
    if (req.user.role !== 'administrator') return res.status(403).json({ success: false, error: 'Forbidden' });
    const { title, message, audience } = req.body;
    const announcement = new Announcement({
      title,
      message,
      audience,
      createdBy: req.user._id,
    });
    await announcement.save();
    res.status(201).json({ success: true, announcement });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete announcement (admin only)
exports.deleteAnnouncement = async (req, res) => {
  try {
    if (req.user.role !== 'administrator') return res.status(403).json({ success: false, error: 'Forbidden' });
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}; 