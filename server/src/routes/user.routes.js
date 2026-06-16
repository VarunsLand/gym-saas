const express = require('express');
const userController = require('../controllers/user.controller');
const { createUserSchema, updateUserRoleSchema } = require('../validations/user.validation');
const validate = require('../middlewares/validate.middleware');
const { requireAuth } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');

const router = express.Router();

// Apply base authentication middleware to all user routes
router.use(requireAuth);

/**
 * @route   GET /api/v1/users
 * @desc    Fetch all active staff members within the tenant
 * @access  Private
 */
router.get(
  '/', 
  userController.getUsers
);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Fetch a specific user profile
 * @access  Private
 */
router.get(
  '/:id', 
  userController.getUserById
);

/**
 * @route   POST /api/v1/users
 * @desc    Provision a new staff member account
 * @access  Private (Admin Only)
 */
router.post(
  '/',
  requireAdmin, // Enforce admin-only access at the routing layer
  validate(createUserSchema),
  userController.createUser
);

/**
 * @route   PATCH /api/v1/users/:id/role
 * @desc    Promote or demote an existing staff member
 * @access  Private (Admin Only)
 */
router.patch(
  '/:id/role',
  requireAdmin, // Enforce admin-only access at the routing layer
  validate(updateUserRoleSchema),
  userController.updateUserRole
);

module.exports = router;
