const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
    issuer: 'scalable-rest-api',
    audience: 'scalable-rest-api-users'
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'scalable-rest-api',
      audience: 'scalable-rest-api-users'
    });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

const extractToken = (authHeader) => {
  if (!authHeader) {
    throw new Error('Authorization header is required');
  }

  if (!authHeader.startsWith('Bearer ')) {
    throw new Error('Authorization header must start with Bearer');
  }

  const token = authHeader.substring(7);
  if (!token) {
    throw new Error('Token is required');
  }

  return token;
};

module.exports = {
  generateToken,
  verifyToken,
  extractToken
};