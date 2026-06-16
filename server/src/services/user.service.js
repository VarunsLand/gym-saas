const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const { hashPassword } = require('../utils/passwordUtils');

class UserService {
  /**
   * Fetch all active staff members within the requesting tenant's workspace.
   * @param {string} tenantId - The UUID of the tenant
   */
  static async getUsers(tenantId) {
    return prisma.user.findMany({
      where: {
        tenant_id: tenantId,
        deleted_at: null // Soft-delete aware
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        role: true,
        last_login_at: true,
        created_at: true
      },
      orderBy: { first_name: 'asc' }
    });
  }

  /**
   * Fetch a specific user's profile securely.
   * @param {string} tenantId - The UUID of the tenant
   * @param {string} targetUserId - The UUID of the user to fetch
   */
  static async getUserById(tenantId, targetUserId) {
    const user = await prisma.user.findFirst({
      where: {
        id: targetUserId,
        tenant_id: tenantId, // Strict isolation boundary
        deleted_at: null
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        role: true,
        last_login_at: true,
        created_at: true
      }
    });

    if (!user) {
      throw new ApiError(404, 'User not found or access denied');
    }

    return user;
  }

  /**
   * Provision a new staff member account.
   * @param {string} tenantId - The UUID of the tenant
   * @param {string} requesterRole - The role of the user making the request
   * @param {Object} data - Validated payload containing user details
   */
  static async createUser(tenantId, requesterRole, data) {
    // 1. Enforce Admin-only restriction at the business logic layer
    if (requesterRole !== 'ADMIN') {
      throw new ApiError(403, 'Permission denied: Only administrators can provision new users.');
    }

    const { first_name, last_name, email, password, role } = data;

    // 2. Prevent tenant-scoped email collisions
    const existingUser = await prisma.user.findFirst({
      where: { tenant_id: tenantId, email, deleted_at: null }
    });

    if (existingUser) {
      throw new ApiError(409, 'A staff member with this email address already exists in this workspace.');
    }

    // 3. Hash password securely
    const hashedPassword = await hashPassword(password);

    // 4. Create the user securely attached to the tenant
    const user = await prisma.user.create({
      data: {
        tenant_id: tenantId,
        first_name,
        last_name,
        email,
        password_hash: hashedPassword,
        role: role || 'STAFF'
      }
    });

    // Strip sensitive hash before returning
    delete user.password_hash;
    return user;
  }

  /**
   * Modify the role of an existing user.
   * @param {string} tenantId - The UUID of the tenant
   * @param {string} requesterRole - The role of the user making the request
   * @param {string} targetUserId - The UUID of the user to update
   * @param {string} newRole - The target 'UserRole' enum value
   */
  static async updateUserRole(tenantId, requesterRole, targetUserId, newRole) {
    // 1. Enforce Admin-only restriction
    if (requesterRole !== 'ADMIN') {
      throw new ApiError(403, 'Permission denied: Only administrators can modify roles.');
    }

    // 2. Strict check: Ensure the target user actually exists in the same tenant
    const existingUser = await prisma.user.findFirst({
      where: {
        id: targetUserId,
        tenant_id: tenantId,
        deleted_at: null
      }
    });

    if (!existingUser) {
      throw new ApiError(404, 'User not found or access denied');
    }

    // Prevent demoting the last admin (basic safeguard)
    // In a full implementation we'd run a count of active ADMINs before allowing an ADMIN to STAFF demotion.
    if (existingUser.role === 'ADMIN' && newRole === 'STAFF') {
      const adminCount = await prisma.user.count({
        where: { tenant_id: tenantId, role: 'ADMIN', deleted_at: null }
      });
      if (adminCount <= 1) {
        throw new ApiError(400, 'Cannot demote the last administrator of the workspace.');
      }
    }

    // 3. Execute update
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole }
    });

    delete updatedUser.password_hash;
    return updatedUser;
  }
}

module.exports = UserService;
