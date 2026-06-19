import { useQuery } from '@tanstack/react-query';
import { getMemberGrowthAnalytics, AnalyticsResponse } from '../services/analyticsService';

interface UseMemberGrowthParams {
  startDate?: string;
  endDate?: string;
  groupBy?: string;
}

export const useMemberGrowth = (params: UseMemberGrowthParams) => {
  return useQuery({
    queryKey: ['analytics', 'memberGrowth', params.startDate, params.endDate, params.groupBy],
    queryFn: () => getMemberGrowthAnalytics(params),
  });
};
