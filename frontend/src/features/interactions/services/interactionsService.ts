import api from '@/services/api';
import { InteractionsResponse, InteractionResponse, CreateInteractionPayload } from '../types';

export const interactionsService = {
  async getInteractions(leadId: string): Promise<InteractionsResponse> {
    const response = await api.get(`/leads/${leadId}/interactions`);
    return response.data;
  },

  async createInteraction(leadId: string, data: CreateInteractionPayload): Promise<InteractionResponse> {
    const response = await api.post(`/leads/${leadId}/interactions`, data);
    return response.data;
  }
};
