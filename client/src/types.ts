export type Role = 'admin' | 'user';

export type AuthUser = {
  id: string;
  role: Role;
  email: string | null;
  phone: string | null;
  mustChangePassword: boolean;
  isProfileComplete: boolean;
  status: 'active' | 'disabled' | 'pending_profile';
};
