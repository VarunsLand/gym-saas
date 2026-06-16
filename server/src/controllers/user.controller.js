const UserService = require('../services/user.service');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Fetch all staff members for the requesting tenant
 * @route   GET /api/v1/users
 * @access  Private
 */
const getUsers = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;

  const users = await UserService.getUsers(tenantId);

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users }
  });
});

/**
 * @desc    Fetch a specific user by their ID
 * @route   GET /api/v1/users/:id
 * @access  Private
 */
const getUserById = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const targetUserId = req.params.id;

  const user = await UserService.getUserById(tenantId, targetUserId);

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

/**
 * @desc    Create a new staff member account
 * @route   POST /api/v1/users
 * @access  Private (Admin only logic enforced by Service layer)
 */
const createUser = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const requesterRole = req.user.role; // Extracted directly from JWT payload

  const user = await UserService.createUser(tenantId, requesterRole, req.body);

  res.status(201).json({
    status: 'success',
    data: { user }
  });
});

/**
 * @desc    Update a specific user's role (e.g. STAFF -> ADMIN)
 * @route   PATCH /api/v1/users/:id/role
 * @access  Private (Admin only logic enforced by Service layer)
 */
const updateUserRole = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const requesterRole = req.user.role;
  const targetUserId = req.params.id;
  const newRole = req.body.role;

  const user = await UserService.updateUserRole(tenantId, requesterRole, targetUserId, newRole);

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUserRole
};
