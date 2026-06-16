import api from '@/services/api';
import { MetricsResponse, ActivityResponse } from '../types';

export const dashboardService = {
  async getMetrics(): Promise<MetricsResponse> {
    const response = await api.get('/dashboard/metrics');
    return response.data;
  },

  async getActivity(limit: number = 15): Promise<ActivityResponse> {
    const response = await api.get(`/dashboard/activity?limit=${limit}`);
    return response.data;
  }
};
