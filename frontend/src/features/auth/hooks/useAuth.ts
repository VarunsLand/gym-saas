import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '../services/authService';
import { toast } from 'sonner';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Signup Mutation
  const signupMutation = useMutation({
    mutationFn: authService.signup,
    onSuccess: (data) => {
      if (data.data.token) {
        localStorage.setItem('token', data.data.token);
        // Force React Query to clear any old user data and refetch
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        toast.success('Account created successfully!');
        router.push('/');
      }
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || 'Failed to sign up';
      toast.error(message);
    },
  });

  // Login Mutation
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      if (data.data.token) {
        localStorage.setItem('token', data.data.token);
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        toast.success('Logged in successfully!');
        router.push('/');
      }
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || 'Invalid email or password';
      toast.error(message);
    },
  });

  // Fetch Current User
  const { data: currentUser, isLoading: isUserLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    retry: false, // Don't retry if it fails (e.g., 401 Unauthorized)
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('token'), // Only fetch if we have a token
  });

  const logout = () => {
    localStorage.removeItem('token');
    queryClient.clear();
    toast.info('Logged out successfully');
    router.push('/login');
  };

  return {
    signup: signupMutation.mutate,
    isSigningUp: signupMutation.isPending,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    currentUser: currentUser?.data?.user,
    isUserLoading,
    logout,
  };
};
