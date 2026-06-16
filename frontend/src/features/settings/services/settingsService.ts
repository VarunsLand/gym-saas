import api from '@/services/api';
import { 
  ProfileResponse, 
  UpdateProfilePayload, 
  LeadSourcesResponse, 
  SingleLeadSourceResponse, 
  CreateLeadSourcePayload 
} from '../types';

export const settingsService = {
  async getProfile(): Promise<ProfileResponse> {
    const response = await api.get('/settings/profile');
    return response.data;
  },

  async updateProfile(data: UpdateProfilePayload): Promise<ProfileResponse> {
    const response = await api.patch('/settings/profile', data);
    return response.data;
  },

  async getLeadSources(): Promise<LeadSourcesResponse> {
    const response = await api.get('/settings/lead-sources');
    return response.data;
  },

  async createLeadSource(data: CreateLeadSourcePayload): Promise<SingleLeadSourceResponse> {
    const response = await api.post('/settings/lead-sources', data);
    return response.data;
  }
};
