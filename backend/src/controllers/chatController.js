const ChatMessage = require('../models/ChatMessage');

// Get all chat messages (top-level only, populate user and replies)
exports.getMessages = async (req, res) => {
  try {
    const messages = await ChatMessage.find({ parent: null })
      .populate('user', 'firstName lastName')
      .populate({ path: 'replies', populate: { path: 'user', select: 'firstName lastName' } })
      .sort({ createdAt: 1 });
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Post a new message
exports.postMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const message = new ChatMessage({
      user: req.user._id,
      text,
    });
    await message.save();
    await message.populate('user', 'firstName lastName');
    res.status(201).json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Like a message
exports.likeMessage = async (req, res) => {
  try {
    const message = await ChatMessage.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Unlike a message
exports.unlikeMessage = async (req, res) => {
  try {
    const message = await ChatMessage.findByIdAndUpdate(
      req.params.id,
      { $inc: { unlikes: 1 } },
      { new: true }
    );
    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Reply to a message
exports.replyMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const parent = await ChatMessage.findById(req.params.id);
    if (!parent) return res.status(404).json({ success: false, error: 'Parent message not found' });
    const reply = new ChatMessage({
      user: req.user._id,
      text,
    });
    await reply.save();
    parent.replies.push(reply._id);
    await parent.save();
    await reply.populate('user', 'firstName lastName');
    res.status(201).json({ success: true, reply });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}; 