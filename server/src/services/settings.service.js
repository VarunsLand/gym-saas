const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');

class SettingsService {
  /**
   * Fetch the active tenant's core profile and configuration.
   * @param {string} tenantId - The UUID of the requesting tenant
   */
  static async getTenantProfile(tenantId) {
    const tenant = await prisma.tenant.findFirst({
      where: {
        id: tenantId,
        deleted_at: null
      }
    });

    if (!tenant) {
      throw new ApiError(404, 'Workspace not found or is no longer active.');
    }

    return tenant;
  }

  /**
   * Update the tenant's profile securely.
   * @param {string} tenantId - The UUID of the requesting tenant
   * @param {string} requesterRole - The role of the user attempting the update
   * @param {Object} data - The validated payload containing updates (e.g. business_phone, timezone)
   */
  static async updateTenantProfile(tenantId, requesterRole, data) {
    // 1. Enforce Admin-only restriction at the business logic layer
    if (requesterRole !== 'ADMIN') {
      throw new ApiError(403, 'Permission denied: Only administrators can update workspace settings.');
    }

    // 2. Strict check: Ensure workspace exists and isn't soft-deleted
    const tenant = await prisma.tenant.findFirst({
      where: {
        id: tenantId,
        deleted_at: null
      }
    });

    if (!tenant) {
      throw new ApiError(404, 'Workspace not found or is no longer active.');
    }

    // 3. Perform the update
    return prisma.tenant.update({
      where: { id: tenantId },
      data
    });
  }

  /**
   * Fetch all active lead sources for the tenant's drop-downs.
   * @param {string} tenantId - The UUID of the requesting tenant
   */
  static async getLeadSources(tenantId) {
    return prisma.leadSource.findMany({
      where: {
        tenant_id: tenantId,
        is_active: true
      },
      orderBy: { created_at: 'asc' }
    });
  }

  /**
   * Create a new custom lead source.
   * @param {string} tenantId - The UUID of the requesting tenant
   * @param {string} requesterRole - The role of the user attempting creation
   * @param {Object} data - The validated payload containing the source 'name'
   */
  static async createLeadSource(tenantId, requesterRole, data) {
    // 1. Enforce Admin-only restriction
    if (requesterRole !== 'ADMIN') {
      throw new ApiError(403, 'Permission denied: Only administrators can configure lead sources.');
    }

    const { name } = data;

    // 2. Prevent creating duplicate lead sources within the same workspace
    const existingSource = await prisma.leadSource.findFirst({
      where: {
        tenant_id: tenantId,
        name: name,
        is_active: true
      }
    });

    if (existingSource) {
      throw new ApiError(409, `A lead source named "${name}" already exists in this workspace.`);
    }

    // 3. Create the source strictly bound to this tenant
    return prisma.leadSource.create({
      data: {
        ...data,
        tenant_id: tenantId
      }
    });
  }
}

module.exports = SettingsService;
