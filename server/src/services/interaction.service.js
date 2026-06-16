const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');

class InteractionService {
  /**
   * Fetch all interactions for a specific lead, verifying tenant ownership.
   * @param {string} tenantId - The UUID of the tenant
   * @param {string} leadId - The UUID of the lead
   */
  static async getInteractionsByLeadId(tenantId, leadId) {
    // 1. Strict security check: Verify lead exists, belongs to tenant, and isn't soft-deleted
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        tenant_id: tenantId,
        deleted_at: null
      }
    });

    if (!lead) {
      throw new ApiError(404, 'Lead not found or access denied');
    }

    // 2. Fetch interactions (they are inherently safe now, but we enforce tenant_id anyway)
    return prisma.interaction.findMany({
      where: {
        tenant_id: tenantId,
        lead_id: leadId
      },
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: { id: true, first_name: true, last_name: true }
        }
      }
    });
  }

  /**
   * Create a new interaction for a lead.
   * @param {string} tenantId - The UUID of the tenant
   * @param {string} userId - The UUID of the user authoring the note
   * @param {string} leadId - The UUID of the lead
   * @param {Object} data - The validated interaction payload (e.g., type, notes)
   */
  static async createInteraction(tenantId, userId, leadId, data) {
    // 1. Strict security check: Verify lead ownership to prevent cross-tenant injection
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        tenant_id: tenantId,
        deleted_at: null
      }
    });

    if (!lead) {
      throw new ApiError(404, 'Lead not found or access denied');
    }

    // 2. Create the interaction securely, overriding relation IDs with verified context
    return prisma.interaction.create({
      data: {
        ...data,
        tenant_id: tenantId,
        lead_id: leadId,
        user_id: userId
      },
      include: {
        user: {
          select: { id: true, first_name: true, last_name: true }
        }
      }
    });
  }
}

module.exports = InteractionService;
