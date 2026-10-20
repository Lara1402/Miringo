import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole, ApprovalStatus } from '../../types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requiredApproval?: ApprovalStatus[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requiredApproval,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, profile, loading, initialized } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth state is resolving
  if (loading || !initialized) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'radial-gradient(ellipse at top, #0f0f2e 0%, #050510 50%, #000005 100%)' }}
      >
        <div className="w-8 h-8 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin" />
      </div>
    );
  }

  // Not logged in -> redirect to login
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Still waiting for profile to load
  if (!profile) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'radial-gradient(ellipse at top, #0f0f2e 0%, #050510 50%, #000005 100%)' }}
      >
        <div className="text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Check role authorization
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/access-denied" replace />;
  }

  // Check approval status
  if (requiredApproval && !requiredApproval.includes(profile.approval_status)) {
    if (profile.requested_role === 'faculty' && profile.approval_status === 'pending') {
      return <Navigate to="/faculty/pending" replace />;
    }
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
}
