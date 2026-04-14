export type UserRole = 'ADMIN' | 'CLIENT' | 'FREELANCER' | 'USER';

export interface UserPayload {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  role: UserRole;
  enabled: boolean;
}

export interface AppUser extends UserPayload {
  id: number;
  is_staff: boolean;
  is_superuser: boolean;
  created_at: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: AppUser;
}

export const USER_ROLES: UserRole[] = [
  'USER',
  'CLIENT',
  'FREELANCER',
  'ADMIN'
];
