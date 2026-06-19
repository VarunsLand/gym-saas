const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');

class ExpenseService {
  static async createExpense(tenantId, data) {
    return prisma.expense.create({
      data: {
        tenant_id: tenantId,
        category: data.category,
        amount: data.amount,
        notes: data.notes,
        date: data.date ? new Date(data.date) : new Date(),
      },
    });
  }

  static async getExpenses(tenantId, filters = {}) {
    const where = { tenant_id: tenantId };
    
    if (filters.startDate && filters.endDate) {
      where.date = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }

    return prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  static async getExpenseById(tenantId, id) {
    const expense = await prisma.expense.findFirst({
      where: { id, tenant_id: tenantId },
    });
    if (!expense) throw new ApiError(404, 'Expense not found');
    return expense;
  }

  static async updateExpense(tenantId, id, data) {
    await this.getExpenseById(tenantId, id);
    
    const updateData = {};
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.notes !== undefined) updateData.notes = data.notes;

    return prisma.expense.update({
      where: { id },
      data: updateData,
    });
  }

  static async deleteExpense(tenantId, id) {
    await this.getExpenseById(tenantId, id);
    return prisma.expense.delete({ where: { id } });
  }
}

module.exports = ExpenseService;
