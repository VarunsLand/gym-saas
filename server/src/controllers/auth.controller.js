const AuthService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Register a new business tenant and its initial admin user
 * @route   POST /api/v1/auth/signup
 * @access  Public
 */
const signup = catchAsync(async (req, res) => {
  // The payload has already been validated and sanitized by Zod middleware
  const result = await AuthService.signup(req.body);
  
  res.status(201).json({
    status: 'success',
    data: result
  });
});

/**
 * @desc    Authenticate user and get token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = catchAsync(async (req, res) => {
  const result = await AuthService.login(req.body);

  res.status(200).json({
    status: 'success',
    data: result
  });
});

/**
 * @desc    Get current logged in user's profile and tenant info
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getCurrentUser = catchAsync(async (req, res) => {
  // req.user is strictly populated by the auth.middleware.js
  const userId = req.user.user_id;
  const tenantId = req.user.tenant_id;

  const user = await AuthService.getCurrentUser(userId, tenantId);

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

module.exports = {
  signup,
  login,
  getCurrentUser
};
