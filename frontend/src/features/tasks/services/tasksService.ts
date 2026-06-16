import api from '@/services/api';
import { TasksResponse, TaskResponse, CreateTaskPayload, UpdateTaskPayload } from '../types';

export const tasksService = {
  async getTasks(leadId?: string): Promise<TasksResponse> {
    const url = leadId ? `/tasks?lead_id=${leadId}` : `/tasks`;
    const response = await api.get(url);
    return response.data;
  },

  async createTask(leadId: string, data: CreateTaskPayload): Promise<TaskResponse> {
    const response = await api.post(`/leads/${leadId}/tasks`, data);
    return response.data;
  },

  async updateTask(taskId: string, data: UpdateTaskPayload): Promise<TaskResponse> {
    const response = await api.patch(`/tasks/${taskId}`, data);
    return response.data;
  }
};
