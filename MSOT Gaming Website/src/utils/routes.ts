import type { UserRole, ApprovalStatus } from '../types';

export function getRedirectPath(role: UserRole, approvalStatus: ApprovalStatus): string {
  switch (role) {
    case 'admin':
      return '/admin/users';
    case 'faculty':
      if (approvalStatus === 'approved') return '/faculty/dashboard';
      return '/faculty/pending';
    case 'student':
    default:
      return '/dashboard';
  }
}

export function canAccessRoute(
  path: string,
  role: UserRole | undefined,
  approvalStatus: ApprovalStatus | undefined
): boolean {
  if (!role) return false;

  const adminRoutes = ['/admin'];
  const facultyRoutes = ['/faculty/dashboard'];
  const pendingRoutes = ['/faculty/pending'];

  if (adminRoutes.some(r => path.startsWith(r))) {
    return role === 'admin';
  }

  if (facultyRoutes.some(r => path.startsWith(r))) {
    return role === 'faculty' && approvalStatus === 'approved';
  }

  if (pendingRoutes.some(r => path.startsWith(r))) {
    return (role === 'faculty' || role === 'student') && 
      (approvalStatus === 'pending' || approvalStatus === 'rejected');
  }

  if (path === '/dashboard') {
    return role === 'student' || (role === 'faculty' && approvalStatus === 'approved');
  }

  return true;
}
