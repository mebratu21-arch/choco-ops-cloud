import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';

interface RoleBasedRouteProps {
  roleComponents: Partial<Record<UserRole, React.ComponentType>>;
  fallback?: React.ComponentType;
}

import * as AuthUtils from '../lib/auth-utils';

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ roleComponents, fallback: FallbackComponent }) => {
  const { useCurrentUser } = useAuth();
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null; // Should be handled by ProtectedRoute wrapper usually
  }

  // Normalize role to strict frontend types using shared utility
  const normalizedRole = AuthUtils.normalizeRole(user.role);
  const Component = roleComponents[normalizedRole];

  if (Component) {
    return <Component />;
  }

  if (FallbackComponent) {
    return <FallbackComponent />;
  }

  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-semibold mb-2">No Dashboard Available</h2>
      <p className="text-muted-foreground">
        No specific dashboard is configured for your role ({user.role} &rarr; {normalizedRole}).
      </p>
    </div>
  );
};

export default RoleBasedRoute;
