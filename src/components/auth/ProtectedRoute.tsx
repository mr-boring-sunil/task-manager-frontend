/**
 * Protected Route Wrapper
 * Guarantees device selection and active authenticated session before rendering dashboard routes.
 * Raspberry Pi Task Manager — Dashboard
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RefreshCw, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiredPermission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
}) => {
  const location = useLocation();
  const { selectedDevice, isAuthenticated, isLoading, hasPermission } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 space-y-3">
        <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
        <p className="text-xs font-mono text-slate-400">Verifying authenticated session...</p>
      </div>
    );
  }

  // 1. Device must be selected
  if (!selectedDevice) {
    return <Navigate to="/discover" state={{ from: location }} replace />;
  }

  // 2. User must have an active authenticated session
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Permission check (if specified)
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="p-8 text-center space-y-3 max-w-md mx-auto mt-20">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-semibold text-slate-100">Access Restricted</h2>
        <p className="text-xs text-slate-400">
          Your account does not possess the required permission (<code className="text-rose-400">{requiredPermission}</code>) to view this page.
        </p>
      </div>
    );
  }

  return children ? <>{children}</> : null;
};
