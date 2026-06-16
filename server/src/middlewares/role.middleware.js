const ApiError = require('../utils/ApiError');

/**
 * Express middleware to restrict route access strictly to ADMIN users.
 * MUST be placed chronologically after the `requireAuth` middleware so that `req.user` is populated.
 */
const requireAdmin = (req, res, next) => {
  // Defensive check: ensure the auth middleware ran successfully
  if (!req.user || !req.user.role) {
    return next(new ApiError(401, 'Authentication context missing. Cannot verify role.'));
  }

  // Enforce ADMIN constraint
  if (req.user.role !== 'ADMIN') {
    return next(new ApiError(403, 'Permission denied: This action strictly requires Administrator privileges.'));
  }

  // Proceed to the next middleware or controller
  next();
};

module.exports = {
  requireAdmin
};
