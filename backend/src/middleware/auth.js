const User = require('../models/User');
const { generateToken, verifyToken, extractToken } = require('../utils/jwt');

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = extractToken(authHeader);
    
    const decoded = verifyToken(token);
    
    // Find user and check if still exists and is active
    const user = await User.findById(decoded.id).select('+passwordChangedAt');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    // Check if user changed password after the token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: 'User recently changed password. Please log in again'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Authentication failed'
    });
  }
};

// Authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to access this resource'
      });
    }

    next();
  };
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return next();
    }

    const token = extractToken(authHeader);
    const decoded = verifyToken(token);
    
    const user = await User.findById(decoded.id);
    
    if (user && user.isActive && !user.changedPasswordAfter(decoded.iat)) {
      req.user = user;
    }
  } catch (error) {
    // Silently fail for optional auth
  }
  
  next();
};

// Middleware to check if user owns resource or is admin
const checkOwnership = (resourceUserField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resource = req.resource || req.params;
    const resourceUserId = resource[resourceUserField];

    if (!resourceUserId || !req.user._id.equals(resourceUserId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources'
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  checkOwnership
};