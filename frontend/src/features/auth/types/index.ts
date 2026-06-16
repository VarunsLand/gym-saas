export interface User {
  id: string;
  tenant_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'ADMIN' | 'STAFF';
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  industry: string | null;
  timezone: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
}

export interface SignupPayload {
  business_name: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  status: string;
  data: {
    token?: string;
    user: User;
    tenant: Tenant;
  };
}

export interface CurrentUserResponse {
  status: string;
  data: {
    user: User;
  };
}
