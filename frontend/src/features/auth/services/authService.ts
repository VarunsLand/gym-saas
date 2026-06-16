import api from '@/services/api';
import { AuthResponse, CurrentUserResponse, SignupPayload } from '../types';

export const authService = {
  async signup(data: SignupPayload): Promise<AuthResponse> {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  async login(data: Record<string, unknown>): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async getCurrentUser(): Promise<CurrentUserResponse> {
    const response = await api.get('/auth/me');
    return response.data;
  }
};
