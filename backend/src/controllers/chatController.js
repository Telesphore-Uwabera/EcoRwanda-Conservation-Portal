const ChatMessage = require('../models/ChatMessage');

// Get all chat messages (top-level only, populate user and replies)
exports.getMessages = async (req, res) => {
  try {
    const messages = await ChatMessage.find({ replyTo: null })
      .populate('user', 'firstName lastName role')
      .populate({ path: 'replies', populate: { path: 'user', select: 'firstName lastName role' } })
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
    await message.populate('user', 'firstName lastName role');
    res.status(201).json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Like a message
exports.likeMessage = async (req, res) => {
  try {
    const message = await ChatMessage.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, error: 'Message not found' });
    const userId = req.user._id.toString();
    const liked = message.likedBy.map(id => id.toString()).includes(userId);
    const unliked = message.unlikedBy.map(id => id.toString()).includes(userId);
    if (liked) {
      // Toggle off like
      message.likedBy = message.likedBy.filter(id => id.toString() !== userId);
    } else {
      message.likedBy.push(req.user._id);
      // Remove from unlikedBy if present
      message.unlikedBy = message.unlikedBy.filter(id => id.toString() !== userId);
    }
    await message.save();
    await message.populate('user', 'firstName lastName role');
    res.json({ success: true, message: { ...message.toObject(), likes: message.likedBy.length, unlikes: message.unlikedBy.length } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Unlike a message
exports.unlikeMessage = async (req, res) => {
  try {
    const message = await ChatMessage.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, error: 'Message not found' });
    const userId = req.user._id.toString();
    const liked = message.likedBy.map(id => id.toString()).includes(userId);
    const unliked = message.unlikedBy.map(id => id.toString()).includes(userId);
    if (unliked) {
      // Toggle off unlike
      message.unlikedBy = message.unlikedBy.filter(id => id.toString() !== userId);
    } else {
      message.unlikedBy.push(req.user._id);
      // Remove from likedBy if present
      message.likedBy = message.likedBy.filter(id => id.toString() !== userId);
    }
    await message.save();
    await message.populate('user', 'firstName lastName role');
    res.json({ success: true, message: { ...message.toObject(), likes: message.likedBy.length, unlikes: message.unlikedBy.length } });
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
      replyTo: parent._id,
    });
    await reply.save();
    parent.replies.push(reply._id);
    await parent.save();
    await reply.populate('user', 'firstName lastName role');
    res.status(201).json({ success: true, reply });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Edit a message
exports.editMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const message = await ChatMessage.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, error: 'Message not found' });

    // Check if the user is the author
    if (message.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'User not authorized to edit this message' });
    }

    message.text = text;
    await message.save();
    await message.populate('user', 'firstName lastName role');
    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const message = await ChatMessage.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, error: 'Message not found' });

    // Check if the user is the author
    if (message.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'User not authorized to delete this message' });
    }

    // If it's a reply, remove it from the parent's replies array
    if (message.replyTo) {
      await ChatMessage.updateOne({ _id: message.replyTo }, { $pull: { replies: message._id } });
    }
    
    // Also delete any replies to this message
    if (message.replies && message.replies.length > 0) {
      await ChatMessage.deleteMany({ _id: { $in: message.replies } });
    }

    await message.deleteOne();

    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}; 