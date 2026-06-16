const { verifyToken } = require('../utils/jwtUtils');
const ApiError = require('../utils/ApiError');

/**
 * Middleware to protect routes by requiring a valid JWT token.
 * Extracts the token, verifies it, and securely attaches the decoded payload to req.user.
 */
const requireAuth = (req, res, next) => {
  try {
    // 1. Ensure the Authorization header exists and follows the Bearer schema
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Access denied. No valid Bearer token provided in Authorization header.');
    }

    // 2. Extract the raw token string
    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new ApiError(401, 'Access denied. Token string is missing.');
    }

    // 3. Verify and decode the token. 
    // `verifyToken` will throw an ApiError if the token is expired or malformed.
    const decodedPayload = verifyToken(token);

    // 4. Validate the required multi-tenant payload structure
    if (!decodedPayload.user_id || !decodedPayload.tenant_id || !decodedPayload.role) {
      throw new ApiError(401, 'Invalid token payload. Missing required context (user_id, tenant_id, role).');
    }

    // 5. Attach payload to req.user for downstream controller usage
    req.user = {
      user_id: decodedPayload.user_id,
      tenant_id: decodedPayload.tenant_id,
      role: decodedPayload.role
    };

    // 6. Pass control to the next middleware or route handler
    next();
  } catch (error) {
    // Pass existing ApiErrors down to the global error handler
    if (error.statusCode) {
      return next(error);
    }
    
    // Wrap any unexpected verification failures in a standard 401 response
    return next(new ApiError(401, 'Authentication failed. Please log in again.'));
  }
};

module.exports = {
  requireAuth
};
