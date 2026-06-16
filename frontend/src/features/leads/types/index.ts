export type LeadStatus = 'NEW' | 'IN_PROGRESS' | 'WON' | 'LOST';

export interface Lead {
  id: string;
  tenant_id: string;
  source_id?: string | null;
  assigned_to?: string | null;
  first_name: string;
  last_name?: string | null;
  phone_number: string;
  email?: string | null;
  service?: string | null;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
}

export interface LeadsResponse {
  status: string;
  results: number;
  data: {
    leads: Lead[];
  };
}

export interface LeadResponse {
  status: string;
  data: {
    lead: Lead;
  };
}

export interface CreateLeadPayload {
  first_name: string;
  last_name?: string;
  email?: string;
  phone_number: string;
}

export interface UpdateLeadStatusPayload {
  status: LeadStatus;
}
