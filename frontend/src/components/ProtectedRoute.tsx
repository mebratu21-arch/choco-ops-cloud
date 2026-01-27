import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore(state => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated()
  }));

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Case-insensitive check
  if (allowedRoles && user) {
     const hasRole = allowedRoles.some(r => r.toUpperCase() === user.role.toUpperCase());
     if (!hasRole) return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
