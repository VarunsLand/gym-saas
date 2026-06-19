const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');

class SaleService {
  static async createSale(tenantId, data) {
    return prisma.sale.create({
      data: {
        tenant_id: tenantId,
        lead_id: data.lead_id,
        amount: data.amount,
        type: data.type,
        date: data.date ? new Date(data.date) : new Date(),
      },
    });
  }

  static async getSales(tenantId, filters = {}) {
    const where = { tenant_id: tenantId };
    
    if (filters.startDate && filters.endDate) {
      where.date = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }

    return prisma.sale.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        lead: {
          select: { id: true, first_name: true, last_name: true, service: true }
        }
      }
    });
  }

  static async getSaleById(tenantId, id) {
    const sale = await prisma.sale.findFirst({
      where: { id, tenant_id: tenantId },
    });
    if (!sale) throw new ApiError(404, 'Sale not found');
    return sale;
  }

  static async updateSale(tenantId, id, data) {
    await this.getSaleById(tenantId, id);
    
    const updateData = {};
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.lead_id !== undefined) updateData.lead_id = data.lead_id;

    return prisma.sale.update({
      where: { id },
      data: updateData,
    });
  }

  static async deleteSale(tenantId, id) {
    await this.getSaleById(tenantId, id);
    return prisma.sale.delete({ where: { id } });
  }
}

module.exports = SaleService;
