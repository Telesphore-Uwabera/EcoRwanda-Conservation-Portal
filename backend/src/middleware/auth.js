const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded JWT:', decoded);
    const userId = decoded._id || decoded.id;
    req.user = { ...decoded, _id: userId, id: userId };
    console.log('req.user set by middleware:', req.user);
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