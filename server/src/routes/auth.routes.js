const express = require('express');
const authController = require('../controllers/auth.controller');
const { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../validations/auth.validation');
const validate = require('../middlewares/validate.middleware');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @route   POST /api/v1/auth/signup
 * @desc    Register a new business tenant and its initial admin user
 * @access  Public
 */
router.post(
  '/signup',
  validate(signupSchema),
  authController.signup
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user and return JWT
 * @access  Public
 */
router.post(
  '/login',
  validate(loginSchema),
  authController.login
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get currently logged-in user profile
 * @access  Private (Requires valid JWT)
 */
router.get(
  '/me',
  requireAuth,
  authController.getCurrentUser
);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Generate password reset token and send email
 * @access  Public
 */
router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  authController.forgotPassword
);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 */
router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  authController.resetPassword
);

module.exports = router;
