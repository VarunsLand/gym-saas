import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interactionsService } from '../services/interactionsService';
import { CreateInteractionPayload } from '../types';
import { toast } from 'sonner';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useInteractions = (leadId: string) => {
  return useQuery({
    queryKey: ['interactions', leadId],
    queryFn: () => interactionsService.getInteractions(leadId),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateInteraction = (leadId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInteractionPayload) => interactionsService.createInteraction(leadId, data),
    onSuccess: () => {
      toast.success('Interaction logged successfully');
      queryClient.invalidateQueries({ queryKey: ['interactions', leadId] });
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      queryClient.invalidateQueries({ queryKey: ['dashboardActivity'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || 'Failed to log interaction';
      toast.error(message);
    },
  });
};
