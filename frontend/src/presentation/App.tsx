import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/presentation/pages/auth/LoginPage';
import DashboardPage from '@/presentation/pages/dashboard/DashboardPage';
import InventoryPage from '@/presentation/pages/inventory/InventoryPage';
import ProductionPage from '@/presentation/pages/production/ProductionPage';
import SalesPage from '@/presentation/pages/sales/SalesPage';
import AppLayout from '@/presentation/components/layout/AppLayout';
import { useAuthStore } from '@/presentation/store/auth';

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const isAuth = useAuthStore((s) => s.isAuthenticated());
  return isAuth ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/production" element={<ProductionPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/chat" element={<div>Chat Full Page (Coming Soon)</div>} />
        </Route>

         {/* Catch all */}
         <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

