export type TaskStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface TaskAssignee {
  id: string;
  first_name: string;
  last_name: string;
}

export interface TaskLead {
  id: string;
  first_name: string;
  last_name: string;
}

export interface Task {
  id: string;
  tenant_id: string;
  lead_id: string;
  assigned_to: string;
  due_date: string;
  status: TaskStatus;
  completed_at?: string | null;
  created_at: string;
  assignee?: TaskAssignee | null;
  lead?: TaskLead | null;
}

export interface TasksResponse {
  status: string;
  results: number;
  data: {
    tasks: Task[];
  };
}

export interface TaskResponse {
  status: string;
  data: {
    task: Task;
  };
}

export interface CreateTaskPayload {
  due_date: string;
  assigned_to: string;
}

export interface UpdateTaskPayload {
  status?: TaskStatus;
  due_date?: string;
}
