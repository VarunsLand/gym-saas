const express = require('express');
const authController = require('../controllers/auth.controller');
const { signupSchema, loginSchema } = require('../validations/auth.validation');
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

module.exports = router;
