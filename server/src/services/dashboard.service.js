const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');

class DashboardService {
  /**
   * Calculate high-level KPIs for the tenant dashboard.
   * Runs queries concurrently for maximum performance.
   * @param {string} tenantId - UUID of the requesting tenant
   */
  static async getDashboardMetrics(tenantId) {
    const now = new Date();
    
    // Create UTC midnight boundaries for "today"
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    // Execute multiple independent count queries concurrently
    const [total_leads, leads_won, leads_lost, tasks_due_today] = await Promise.all([
      // Total active leads
      prisma.lead.count({ 
        where: { tenant_id: tenantId, deleted_at: null } 
      }),
      // Leads won
      prisma.lead.count({ 
        where: { tenant_id: tenantId, deleted_at: null, status: 'WON' } 
      }),
      // Leads lost
      prisma.lead.count({ 
        where: { tenant_id: tenantId, deleted_at: null, status: 'LOST' } 
      }),
      // Tasks due exactly today
      prisma.followUpTask.count({
        where: {
          tenant_id: tenantId,
          status: 'PENDING',
          due_date: {
            gte: startOfToday,
            lt: endOfToday
          },
          lead: { deleted_at: null } // Strict soft-delete boundary
        }
      })
    ]);

    return {
      total_leads,
      leads_won,
      leads_lost,
      tasks_due_today
    };
  }

  /**
   * Fetch recent global timeline activity across all leads in the workspace.
   * Automatically captures "STATUS_CHANGE" logs and regular interactions.
   * @param {string} tenantId - UUID of the requesting tenant
   * @param {number} limit - Number of activities to fetch (default: 15)
   */
  static async getRecentActivity(tenantId, limit = 15) {
    // Fetch global interactions securely scoped to the tenant
    return prisma.interaction.findMany({
      where: {
        tenant_id: tenantId,
        lead: { deleted_at: null } // Prevent showing activity for deleted leads
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      include: {
        user: {
          select: { id: true, first_name: true, last_name: true }
        },
        lead: {
          select: { id: true, first_name: true, last_name: true }
        }
      }
    });
  }
}

module.exports = DashboardService;
