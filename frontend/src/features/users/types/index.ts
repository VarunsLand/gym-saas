export type UserRole = 'ADMIN' | 'STAFF';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  status?: UserStatus; // To support future statuses as requested
  last_login_at: string | null;
  created_at: string;
}

export interface UsersResponse {
  status: string;
  results: number;
  data: {
    users: User[];
  };
}

export interface UserResponse {
  status: string;
  data: {
    user: User;
  };
}

export interface CreateUserPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserRolePayload {
  role: UserRole;
}
