import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';

export const useDashboardAnalytics = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['dashboardAnalytics', startDate, endDate],
    queryFn: () => dashboardService.getAnalytics(startDate, endDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
