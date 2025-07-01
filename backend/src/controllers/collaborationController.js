const CollaborationThread = require('../models/CollaborationThread');

// Get all threads
exports.getThreads = async (req, res) => {
  try {
    const threads = await CollaborationThread.find()
      .populate('createdBy', 'firstName lastName')
      .populate('comments.user', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json({ success: true, threads });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Create a new thread
exports.createThread = async (req, res) => {
  try {
    const { title, description } = req.body;
    const thread = new CollaborationThread({
      title,
      description,
      createdBy: req.user._id,
    });
    await thread.save();
    await thread.populate('createdBy', 'firstName lastName');
    res.status(201).json({ success: true, thread });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Add a comment to a thread
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const thread = await CollaborationThread.findById(req.params.id);
    if (!thread) return res.status(404).json({ success: false, error: 'Thread not found' });
    thread.comments.push({ user: req.user._id, text });
    await thread.save();
    await thread.populate('createdBy', 'firstName lastName');
    await thread.populate('comments.user', 'firstName lastName');
    res.status(201).json({ success: true, thread });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}; 