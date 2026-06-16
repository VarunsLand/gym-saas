const jwt = require('jsonwebtoken');
const ApiError = require('./ApiError');

/**
 * Generates a standard JWT for the application.
 * @param {Object} payload - Must contain { user_id, tenant_id, role }
 * @returns {string} Signed JWT string
 */
const generateToken = (payload) => {
  if (!payload.user_id || !payload.tenant_id || !payload.role) {
    throw new Error('Missing required payload fields for JWT generation (user_id, tenant_id, role)');
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('FATAL CONFIG ERROR: JWT_SECRET environment variable is not defined.');
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    {
      user_id: payload.user_id,
      tenant_id: payload.tenant_id,
      role: payload.role
    },
    secret,
    { expiresIn }
  );
};

/**
 * Verifies a JWT and returns the decoded payload.
 * Throws ApiError on failure, which will be caught by Express error handlers.
 * @param {string} token - The raw JWT token string
 * @returns {Object} Decoded payload containing { user_id, tenant_id, role }
 */
const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('FATAL CONFIG ERROR: JWT_SECRET environment variable is not defined.');
  }

  try {
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Your session has expired. Please log in again.');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, 'Invalid or malformed authentication token.');
    }
    throw new ApiError(401, 'Authentication failed.');
  }
};

module.exports = {
  generateToken,
  verifyToken
};
