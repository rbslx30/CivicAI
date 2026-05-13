const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ success: false, message: 'Access Denied: No Token Provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(404).json({ success: false, message: 'User not found' });
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: 'Invalid or Expired Token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'super_admin' || req.user.role === 'department_admin')) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access Denied: Admin privileges required.' });
  }
};

// Helper middleware for specific roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access Denied: You do not have the required role (${roles.join(', ')}).` 
      });
    }
    next();
  };
};

module.exports = { verifyToken, isAdmin, authorizeRoles };