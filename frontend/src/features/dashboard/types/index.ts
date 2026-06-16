import { Interaction } from '@/features/interactions/types';

export interface DashboardMetrics {
  total_leads: number;
  leads_won: number;
  leads_lost: number;
  tasks_due_today: number;
}

export interface MetricsResponse {
  status: string;
  data: {
    metrics: DashboardMetrics;
  };
}

export interface ActivityResponse {
  status: string;
  results: number;
  data: {
    activity: Interaction[];
  };
}
