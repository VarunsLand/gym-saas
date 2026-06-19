import api from '@/services/api';

export const dashboardService = {
  async getAnalytics(startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/analytics/dashboard?${params.toString()}`);
    return response.data.data;
  }
};
