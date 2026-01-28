import { useAuthStore } from '../../store/authStore';
import { Navigate } from 'react-router-dom';

// Role-specific dashboard imports
import ManagerDashboardPage from '../manager/ManagerDashboardPage';
import AdminDashboardPage from '../admin/AdminDashboardPage';
import MechanicDashboardPage from '../mechanic/MechanicDashboardPage';
import QCDashboardPage from '../qc/QCDashboardPage';
import InventoryPage from '../inventory/InventoryPage';
import ProductionPage from '../production/ProductionPage';
import WarehouseDashboard from '../inventory/WarehouseDashboard';

/**
 * DashboardSelector (formerly DynamicDashboard)
 * Routes users to their role-specific dashboard based on user.role from database
 */
const DashboardSelector = () => {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role?.toUpperCase() || '';

  // Role to Dashboard mapping
  switch (role) {
    case 'WAREHOUSE_WORKER':
    case 'WAREHOUSE':
      return <WarehouseDashboard />;

    case 'PRODUCTION_WORKER':
    case 'PRODUCTION':
    case 'OPERATOR':
      return <ProductionPage />;

    case 'QUALITY_CONTROLLER':
    case 'QC':
      return <QCDashboardPage />;

    case 'MECHANIC':
      return <MechanicDashboardPage />;

    case 'MANAGER':
      return <ManagerDashboardPage />;

    case 'ADMIN':
      return <AdminDashboardPage />;

    default:
      // Fallback for unknown roles - show manager dashboard
      console.warn(`Unknown role: ${role}, showing manager dashboard`);
      return <ManagerDashboardPage />;
  }
};

export default DashboardSelector;
