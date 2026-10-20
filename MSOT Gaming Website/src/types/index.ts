export type UserRole = 'student' | 'faculty' | 'admin';
export type ApprovalStatus = 'not_required' | 'pending' | 'approved' | 'rejected';
export type RequestedRole = 'student' | 'faculty';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  requested_role: RequestedRole;
  approval_status: ApprovalStatus;
  approved_by: string | null;
  approved_at: string | null;
  email_verified?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: import('@supabase/supabase-js').User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
}

export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  accountType: RequestedRole;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export interface AdminUserView extends Profile {
  email_confirmed_at?: string | null;
}

export type FilterStatus = 'all' | 'student' | 'faculty' | 'pending' | 'approved' | 'rejected';
export type SortOrder = 'newest' | 'oldest';

export * from './student';
export * from './quest';

