import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../services/usersService';
import { CreateUserPayload, UpdateUserRolePayload } from '../types';


export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.getUsers(),
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => usersService.getUserById(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserPayload) => usersService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRolePayload }) =>
      usersService.updateUserRole(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
    },
  });
};
