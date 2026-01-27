import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import InventoryPage from './pages/inventory/InventoryPage';
import ProductionPage from './pages/production/ProductionPage';
import SalesPage from './pages/sales/SalesPage';
import MechanicPage from './pages/mechanics/MechanicPage';
import QCPage from './pages/qc/QCPage';
import AdminAIDashboard from './pages/admin/AdminAIDashboard';


function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* Base Layout - Checks Authentication */}
      <Route element={<Layout />}>
         <Route path="/" element={<DashboardPage />} />
         
         {/* Role Protected Routes */}
         <Route element={<ProtectedRoute allowedRoles={['MANAGER', 'WAREHOUSE', 'ADMIN']} />}>
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/sales" element={<SalesPage />} />
         </Route>

         <Route element={<ProtectedRoute allowedRoles={['MANAGER', 'PRODUCTION', 'ADMIN']} />}>
            <Route path="/production" element={<ProductionPage />} />
         </Route>

         <Route element={<ProtectedRoute allowedRoles={['MANAGER', 'MECHANIC', 'ADMIN']} />}>
            <Route path="/mechanics" element={<MechanicPage />} />
         </Route>

         <Route element={<ProtectedRoute allowedRoles={['MANAGER', 'QC', 'ADMIN']} />}>
            <Route path="/qc" element={<QCPage />} />
         </Route>

         <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<div>Admin Page</div>} />
            <Route path="/ai-dashboard" element={<AdminAIDashboard />} />
         </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
