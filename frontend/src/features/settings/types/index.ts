export interface WorkspaceProfile {
  id: string;
  name: string;
  industry: string | null;
  timezone: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
}

export interface LeadSource {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface UpdateProfilePayload {
  name?: string;
  industry?: string | null;
  timezone?: string;
}

export interface CreateLeadSourcePayload {
  name: string;
}

export interface ProfileResponse {
  status: string;
  data: {
    profile: WorkspaceProfile;
  };
}

export interface LeadSourcesResponse {
  status: string;
  results: number;
  data: {
    sources: LeadSource[];
  };
}

export interface SingleLeadSourceResponse {
  status: string;
  data: {
    source: LeadSource;
  };
}
