import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../services/settingsService';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { UpdateProfilePayload, CreateLeadSourcePayload } from '../types';

export const useSettings = () => {
  const queryClient = useQueryClient();

  const { data: profileData, isLoading: isProfileLoading, error: profileError } = useQuery({
    queryKey: ['settings', 'profile'],
    queryFn: settingsService.getProfile,
  });

  const { data: leadSourcesData, isLoading: isLeadSourcesLoading, error: leadSourcesError } = useQuery({
    queryKey: ['settings', 'leadSources'],
    queryFn: settingsService.getLeadSources,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfilePayload) => settingsService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'profile'] });
      // Also invalidate currentUser since workspace name changes might be reflected globally
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Workspace profile updated successfully');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    }
  });

  const createLeadSourceMutation = useMutation({
    mutationFn: (data: CreateLeadSourcePayload) => settingsService.createLeadSource(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'leadSources'] });
      toast.success('Lead source created successfully');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message || 'Failed to create lead source';
      toast.error(message);
    }
  });

  return {
    profile: profileData?.data?.profile,
    isProfileLoading,
    profileError,
    
    leadSources: leadSourcesData?.data?.sources || [],
    isLeadSourcesLoading,
    leadSourcesError,

    updateProfile: updateProfileMutation.mutate,
    isUpdatingProfile: updateProfileMutation.isPending,

    createLeadSource: createLeadSourceMutation.mutate,
    isCreatingLeadSource: createLeadSourceMutation.isPending
  };
};
