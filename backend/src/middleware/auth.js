const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded._id || decoded.id;
    // Fetch the full user object from the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: 'Access Denied: User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Access Denied: Invalid token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'administrator') {
    next();
  } else {
    res.status(403).json({ message: 'Access Denied: Admin role required' });
  }
};

module.exports = {
  authenticateToken,
  isAdmin,
}; 