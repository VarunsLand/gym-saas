import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksService } from '../services/tasksService';
import { CreateTaskPayload, UpdateTaskPayload, TasksResponse } from '../types';
import { toast } from 'sonner';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useTasks = (leadId?: string) => {
  return useQuery({
    queryKey: ['tasks', leadId],
    queryFn: () => tasksService.getTasks(leadId),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateTask = (leadId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskPayload) => tasksService.createTask(leadId, data),
    onSuccess: () => {
      toast.success('Task created successfully');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardActivity'] });
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || 'Failed to create task';
      toast.error(message);
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskPayload }) => 
      tasksService.updateTask(id, data),
    
    // Optimistic Update
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // We don't know if the query was fetched with leadId or without, so we'll just invalidate on success, 
      // but we can try to optimistically update any existing query cache arrays we find.
      // A more robust approach for this specific app is to invalidate on success. Let's do partial optimistic update.
      const queries = queryClient.getQueriesData<TasksResponse>({ queryKey: ['tasks'] });
      
      queries.forEach(([queryKey, oldData]) => {
        if (!oldData?.data?.tasks) return;
        queryClient.setQueryData(queryKey, {
          ...oldData,
          data: {
            ...oldData.data,
            tasks: oldData.data.tasks.map((task) =>
              task.id === id ? { ...task, ...data } : task
            ),
          },
        });
      });

      return { queries, id };
    },
    onSuccess: () => {
      // Refresh to ensure exact backend sync
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardActivity'] });
    },
    onError: (error: ApiError, newTodo, context: { queries?: [import('@tanstack/react-query').QueryKey, unknown][] } | undefined) => {
      // Revert optimistic update
      if (context?.queries) {
        context.queries.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }
      toast.error(error.response?.data?.message || 'Failed to update task');
    },
  });
};
