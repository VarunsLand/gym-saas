import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';

export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: () => dashboardService.getMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDashboardActivity = (limit: number = 15) => {
  return useQuery({
    queryKey: ['dashboardActivity', limit],
    queryFn: () => dashboardService.getActivity(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
