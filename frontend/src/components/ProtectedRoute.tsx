import React, { useState, useEffect, useMemo } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  // Hydration state to prevent redirect before auth context is ready
  const [isHydrated, setIsHydrated] = useState(false);
  
  // FIXED: Use useMemo to stabilize the selector functions
  // This prevents the 'getSnapshot' warning and infinite re-render loops
  const userSelector = useMemo(() => (state: any) => state.user, []);
  const tokenSelector = useMemo(() => (state: any) => state.accessToken, []);

  const user = useAuthStore(userSelector);
  const accessToken = useAuthStore(tokenSelector);
  
  // Compute authentication status from stable state values
  const isAuthenticated = !!user && !!accessToken;

  useEffect(() => {
    // Mark as hydrated after first render - auth state is now reliable
    // Ensure we give Zustand a tick to settle
    const timer = setTimeout(() => setIsHydrated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Show loading state while hydrating to prevent flash redirect
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600 mx-auto mb-4"></div>
          <p className="text-slate-400 font-medium tracking-wide animate-pulse">SECURING CONNECTION...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Case-insensitive role check
  if (allowedRoles && user) {
    const hasRole = allowedRoles.some(r => r.toUpperCase() === user.role.toUpperCase());
    if (!hasRole) {
        // Redirect to their appropriate dashboard if they are logged in but unauthorized for this specific route
        return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};
