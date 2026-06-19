const prisma = require('../config/db');

class AnalyticsService {
  static async getDashboardAnalytics(tenantId, startDateStr, endDateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = startDateStr ? new Date(startDateStr) : new Date(today.getFullYear(), today.getMonth(), 1);
    const end = endDateStr ? new Date(endDateStr) : new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    end.setHours(23, 59, 59, 999);

    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // 1. Members Analytics
    const [activeMembers, inactiveMembers, expiringIn7, expiringIn30, newMembers] = await Promise.all([
      // Active Members: expiry_date >= today
      prisma.lead.count({
        where: { tenant_id: tenantId, deleted_at: null, expiry_date: { gte: today } }
      }),
      // Expired Members: expiry_date < today
      prisma.lead.count({
        where: { tenant_id: tenantId, deleted_at: null, expiry_date: { lt: today } }
      }),
      // Expiring in 7 days
      prisma.lead.count({
        where: { tenant_id: tenantId, deleted_at: null, expiry_date: { gte: today, lte: sevenDaysFromNow } }
      }),
      // Expiring in 30 days
      prisma.lead.count({
        where: { tenant_id: tenantId, deleted_at: null, expiry_date: { gte: today, lte: thirtyDaysFromNow } }
      }),
      // New Members in date range
      prisma.lead.count({
        where: { tenant_id: tenantId, deleted_at: null, created_at: { gte: start, lte: end } }
      })
    ]);

    // 2. Revenue & Sales
    const salesInPeriod = await prisma.sale.findMany({
      where: { tenant_id: tenantId, date: { gte: start, lte: end } }
    });

    const revenue = salesInPeriod.reduce((sum, sale) => sum + Number(sale.amount), 0);
    const renewalSales = salesInPeriod.filter(sale => sale.type === 'MEMBERSHIP_RENEWAL');
    const renewals = renewalSales.length;
    
    // Calculate Renewals Today, Week, Month from renewalSales
    let renewalsToday = 0, renewalsWeek = 0, renewalsMonth = 0;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonthDate = new Date(today.getFullYear(), today.getMonth(), 1);

    renewalSales.forEach(s => {
      if (s.date >= today) renewalsToday++;
      if (s.date >= startOfWeek) renewalsWeek++;
      if (s.date >= startOfMonthDate) renewalsMonth++;
    });

    // 3. Expenses
    const expensesInPeriod = await prisma.expense.findMany({
      where: { tenant_id: tenantId, date: { gte: start, lte: end } }
    });

    const expenses = expensesInPeriod.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const profit = revenue - expenses;

    // Expenses by Category
    const categoryMap = {};
    expensesInPeriod.forEach(exp => {
      categoryMap[exp.category] = (categoryMap[exp.category] || 0) + Number(exp.amount);
    });
    const expensesByCategory = Object.keys(categoryMap).map(cat => ({
      category: cat,
      amount: categoryMap[cat]
    }));

    // 4. Member Growth (Grouped by Date)
    const membersInPeriod = await prisma.lead.findMany({
      where: { tenant_id: tenantId, deleted_at: null, created_at: { gte: start, lte: end } },
      select: { created_at: true }
    });

    const memberGrowthMap = {};
    membersInPeriod.forEach(member => {
      const dateStr = member.created_at.toISOString().split('T')[0];
      memberGrowthMap[dateStr] = (memberGrowthMap[dateStr] || 0) + 1;
    });

    const memberGrowth = Object.keys(memberGrowthMap).sort().map(date => ({
      date,
      count: memberGrowthMap[date]
    }));

    // 5. Revenue Trend (Grouped by Date)
    const revenueTrendMap = {};
    salesInPeriod.forEach(sale => {
      const dateStr = sale.date.toISOString().split('T')[0];
      revenueTrendMap[dateStr] = (revenueTrendMap[dateStr] || 0) + Number(sale.amount);
    });

    const revenueTrend = Object.keys(revenueTrendMap).sort().map(date => ({
      date,
      amount: revenueTrendMap[date]
    }));

    // Previous Period calculation for Trends
    const periodDuration = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - periodDuration);
    const prevEnd = new Date(end.getTime() - periodDuration);

    const prevSales = await prisma.sale.findMany({
      where: { tenant_id: tenantId, date: { gte: prevStart, lte: prevEnd } }
    });
    const prevRevenue = prevSales.reduce((sum, sale) => sum + Number(sale.amount), 0);

    const prevNewMembers = await prisma.lead.count({
      where: { tenant_id: tenantId, deleted_at: null, created_at: { gte: prevStart, lte: prevEnd } }
    });

    return {
      activeMembers,
      inactiveMembers,
      expiringSoon: { in7Days: expiringIn7, in30Days: expiringIn30 },
      newMembers,
      renewals,
      renewalsDetail: {
        today: renewalsToday,
        week: renewalsWeek,
        month: renewalsMonth
      },
      revenue,
      expenses,
      expensesByCategory,
      profit,
      memberGrowth,
      revenueTrend,
      trends: {
        revenuePercentage: prevRevenue === 0 ? (revenue > 0 ? 100 : 0) : ((revenue - prevRevenue) / prevRevenue) * 100,
        membersPercentage: prevNewMembers === 0 ? (newMembers > 0 ? 100 : 0) : ((newMembers - prevNewMembers) / prevNewMembers) * 100,
      }
    };
  }

  static _getWeekString(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
  }

  static async getMemberGrowthAnalytics(tenantId, startDateStr, endDateStr, groupBy = 'day') {
    const start = startDateStr ? new Date(startDateStr) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDateStr ? new Date(endDateStr) : new Date();
    end.setHours(23, 59, 59, 999);

    // Calculate previous period
    const periodDuration = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - periodDuration);
    const prevEnd = new Date(end.getTime() - periodDuration);

    // Fetch members (Leads)
    const members = await prisma.lead.findMany({
      where: { tenant_id: tenantId, deleted_at: null, created_at: { gte: start, lte: end } },
      select: { created_at: true }
    });

    const prevMembersCount = await prisma.lead.count({
      where: { tenant_id: tenantId, deleted_at: null, created_at: { gte: prevStart, lte: prevEnd } }
    });

    // Fetch revenue (Sales)
    const sales = await prisma.sale.findMany({
      where: { tenant_id: tenantId, date: { gte: start, lte: end } },
      select: { date: true, amount: true }
    });

    const prevSales = await prisma.sale.findMany({
      where: { tenant_id: tenantId, date: { gte: prevStart, lte: prevEnd } },
      select: { amount: true }
    });

    const prevRevenue = prevSales.reduce((sum, s) => sum + Number(s.amount), 0);

    // Grouping
    const groupedData = {};

    const getGroupKey = (date) => {
      if (groupBy === 'hour') return date.toISOString().substring(0, 13) + ':00'; // YYYY-MM-DDTHH:00
      if (groupBy === 'day') return date.toISOString().split('T')[0];
      if (groupBy === 'week') return AnalyticsService._getWeekString(date);
      if (groupBy === 'month') return date.toISOString().substring(0, 7); // YYYY-MM
      return date.toISOString().split('T')[0];
    };

    // Pre-fill groupedData for standard intervals if needed (skipped for brevity, dynamic grouping below)
    members.forEach(m => {
      const key = getGroupKey(m.created_at);
      if (!groupedData[key]) groupedData[key] = { period: key, newMembers: 0, revenue: 0 };
      groupedData[key].newMembers += 1;
    });

    sales.forEach(s => {
      const key = getGroupKey(s.date);
      if (!groupedData[key]) groupedData[key] = { period: key, newMembers: 0, revenue: 0 };
      groupedData[key].revenue += Number(s.amount);
    });

    const memberGrowth = Object.values(groupedData).sort((a, b) => a.period.localeCompare(b.period));

    // Calculate totals & Insights
    const currentMembersCount = members.length;
    const currentRevenue = sales.reduce((sum, s) => sum + Number(s.amount), 0);

    const membersGrowthPercent = prevMembersCount === 0 ? (currentMembersCount > 0 ? 100 : 0) : ((currentMembersCount - prevMembersCount) / prevMembersCount) * 100;
    const revenueGrowthPercent = prevRevenue === 0 ? (currentRevenue > 0 ? 100 : 0) : ((currentRevenue - prevRevenue) / prevRevenue) * 100;

    let trend = 'Stable';
    if (currentMembersCount > prevMembersCount) trend = 'Growing';
    else if (currentMembersCount < prevMembersCount) trend = 'Declining';

    // Find Best Period
    let bestPeriod = null;
    let maxMembers = -1;
    memberGrowth.forEach(g => {
      if (g.newMembers > maxMembers) {
        maxMembers = g.newMembers;
        bestPeriod = g.period;
      }
    });

    return {
      memberGrowth,
      revenueSummary: {
        currentRevenue,
        prevRevenue,
        revenueGrowthPercent
      },
      kpi: {
        newMembers: currentMembersCount,
        prevMembers: prevMembersCount,
        membersGrowthPercent
      },
      trend,
      insights: {
        bestPeriod: bestPeriod ? { period: bestPeriod, value: maxMembers } : null,
        highestGrowth: membersGrowthPercent // High level overall growth
      }
    };
  }
}

module.exports = AnalyticsService;
