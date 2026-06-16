import api from '@/services/api';
import { UsersResponse, UserResponse, CreateUserPayload, UpdateUserRolePayload } from '../types';

export const usersService = {
  async getUsers(): Promise<UsersResponse> {
    const response = await api.get('/users');
    return response.data;
  },

  async getUserById(id: string): Promise<UserResponse> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async createUser(data: CreateUserPayload): Promise<UserResponse> {
    const response = await api.post('/users', data);
    return response.data;
  },

  async updateUserRole(id: string, data: UpdateUserRolePayload): Promise<UserResponse> {
    const response = await api.patch(`/users/${id}/role`, data);
    return response.data;
  }
};
