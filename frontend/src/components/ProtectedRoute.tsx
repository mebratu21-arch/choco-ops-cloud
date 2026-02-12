import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { UserRole } from '../types';
import { useAuth } from '../hooks/useAuth';
import * as AuthUtils from '../lib/auth-utils';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const location = useLocation();
  const { useCurrentUser } = useAuth();
  
  // Use the hook to get current user data (cached by React Query)
  // We can also rely on authService.isAuthenticated() for synchronous check
  const isAuthenticated = authService.isAuthenticated();
  const { data: user, isLoading } = useCurrentUser();

  if (!isAuthenticated) {
    // Redirect to login page while saving the attempted url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isLoading) {
    // You might want to render a specific loading spinner here
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }

  // Normalize role to lowercase for comparison using shared utility
  const normalizedRole = AuthUtils.normalizeRole(user?.role ?? '');
  if (allowedRoles && user && !allowedRoles.includes(normalizedRole)) {
    // User does not have permission
    // You could redirect to a customized unauthorized page
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-600">You do not have permission to view this page.</p>
        <button 
          onClick={() => window.history.back()}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Go Back
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
