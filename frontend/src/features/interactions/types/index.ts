export type InteractionType = 'CALL' | 'WHATSAPP' | 'EMAIL' | 'MEETING' | 'WALK_IN' | 'NOTE' | 'STATUS_CHANGE';

export interface InteractionUser {
  id: string;
  first_name: string;
  last_name: string;
}

export interface InteractionLead {
  id: string;
  first_name: string;
  last_name: string;
}

export interface Interaction {
  id: string;
  tenant_id: string;
  lead_id: string;
  user_id?: string | null;
  type: InteractionType;
  notes?: string | null;
  created_at: string;
  user?: InteractionUser | null;
  lead?: InteractionLead | null;
}

export interface InteractionsResponse {
  status: string;
  results: number;
  data: {
    interactions: Interaction[];
  };
}

export interface InteractionResponse {
  status: string;
  data: {
    interaction: Interaction;
  };
}

export interface CreateInteractionPayload {
  type: InteractionType;
  notes: string;
}
