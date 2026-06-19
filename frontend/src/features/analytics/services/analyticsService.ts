import api from '@/services/api';

export interface MemberGrowthDataPoint {
  period: string;
  newMembers: number;
  revenue: number;
}

export interface AnalyticsResponse {
  memberGrowth: MemberGrowthDataPoint[];
  revenueSummary: {
    currentRevenue: number;
    prevRevenue: number;
    revenueGrowthPercent: number;
  };
  kpi: {
    newMembers: number;
    prevMembers: number;
    membersGrowthPercent: number;
  };
  trend: 'Growing' | 'Stable' | 'Declining';
  insights: {
    bestPeriod: { period: string; value: number } | null;
    highestGrowth: number;
  };
}

export const getMemberGrowthAnalytics = async (params: { startDate?: string; endDate?: string; groupBy?: string }): Promise<{ data: AnalyticsResponse }> => {
  const queryParams = new URLSearchParams();
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.groupBy) queryParams.append('groupBy', params.groupBy);

  const response = await api.get(`/analytics/member-growth?${queryParams.toString()}`);
  return response.data;
};
