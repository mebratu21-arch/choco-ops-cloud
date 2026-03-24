import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import socketService from './lib/socketService';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import TasksPage from './pages/tasks/TasksPage';
import ProfilePage from './pages/settings/ProfilePage';
import HelpPage from './pages/support/HelpPage';
import NotificationsPage from './pages/notifications/NotificationsPage';

// Inventory Pages
import InventoryPage from './pages/inventory/InventoryPage';
import InventoryDetailPage from './pages/inventory/InventoryDetailPage';

// Dashboard Pages
import ManagerDashboard from './pages/dashboard/ManagerDashboard';
import SalesDashboard from './pages/dashboard/SalesDashboard';
import ProductionDashboard from './pages/dashboard/ProductionDashboard';
import WarehouseDashboard from './pages/dashboard/WarehouseDashboard';
import QCDashboard from './pages/qc/QCDashboard';
import AnnouncementsPage from './pages/manager/AnnouncementsPage';

// Production Pages
import RecipesPage from './pages/production/RecipesPage';
import RecipeDetailPage from './pages/production/RecipeDetailPage';
import RecipeEditor from './pages/recipes/RecipeEditor';
import BatchesPage from './pages/production/BatchesPage';
import BatchDetailPage from './pages/production/BatchDetailPage';

// Mechanic Pages
import MechanicDashboard from './pages/mechanic/MechanicDashboard';
import SOSAlertsPage from './pages/mechanic/SOSAlertsPage';
import MachinesPage from './pages/mechanic/MachinesPage';
import MachineDetailPage from './pages/mechanic/MachineDetailPage';
import MaintenanceHistoryPage from './pages/mechanic/MaintenanceHistoryPage';

// AI Pages
import AIAssistantPage from './pages/ai/AIAssistantPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserManagement from './pages/admin/UserManagement';


import { useEffect } from 'react';

const App = () => {
  // Create a client
  const queryClient = new QueryClient();

  useEffect(() => {
    // Initialize socket connection
    if (!socketService.isConnected()) {
        // Connection is handled in constructor but good to check
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {/* Toast notifications */}
        <Toaster richColors position="top-right" />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            }
          />

          {/* Dashboard Layout Wrapper */}
          <Route 
             element={
                <ProtectedRoute>
                   <DashboardLayout />
                </ProtectedRoute>
             }
          >
              <Route
                path="/dashboard"
                element={
                    <RoleBasedRoute 
                      roleComponents={{
                        'admin': AdminDashboardPage,
                        'manager': ManagerDashboard,
                        'production_worker': ProductionDashboard,
                        'warehouse_worker': WarehouseDashboard,
                        'quality_controller': QCDashboard,
                        'mechanic': MechanicDashboard,
                      }} 
                    />
                }
              />

              <Route
                path="/inventory"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager', 'warehouse_worker', 'production_worker', 'quality_controller', 'mechanic']}>
                    <InventoryPage />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/inventory/:id"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager', 'warehouse_worker', 'production_worker', 'quality_controller', 'mechanic']}>
                    <InventoryDetailPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/recipes"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager', 'production_worker', 'mechanic', 'warehouse_worker', 'quality_controller']}>
                    <RecipesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recipes/new"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager', 'production_worker']}>
                    <RecipeEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recipes/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager', 'production_worker']}>
                    <RecipeEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recipes/:id"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager', 'production_worker', 'mechanic', 'warehouse_worker', 'quality_controller']}>
                    <RecipeDetailPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/production/recipes"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager', 'production_worker', 'mechanic', 'warehouse_worker', 'quality_controller']}>
                    <RecipesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/production/recipes/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager', 'production_worker']}>
                    <RecipeEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/production/recipes/:id"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager', 'production_worker', 'mechanic', 'warehouse_worker', 'quality_controller']}>
                    <RecipeDetailPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/batches"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager', 'production_worker', 'quality_controller', 'mechanic', 'warehouse_worker']}>
                    <BatchesPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/batches/:id"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager', 'production_worker', 'quality_controller', 'mechanic', 'warehouse_worker']}>
                    <BatchDetailPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/qc"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager', 'quality_controller']}>
                    <QCDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/machines"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager', 'mechanic']}>
                    <MachinesPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/mechanic/machines"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager', 'mechanic']}>
                    <MachinesPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/mechanic/machines/:id"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager', 'mechanic']}>
                    <MachineDetailPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/sos"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager', 'mechanic']}>
                    <SOSAlertsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/mechanic/alerts"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager', 'mechanic']}>
                    <SOSAlertsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/mechanic/history"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager', 'mechanic']}>
                    <MaintenanceHistoryPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/maintenance"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager', 'mechanic']}>
                    <MachinesPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/announcements"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <AnnouncementsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/users"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/sales"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <SalesDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <TasksPage />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/ai-assistant"
                element={
                  <ProtectedRoute>
                    <AIAssistantPage />
                  </ProtectedRoute>
                }
              />

              <Route
                  path="/profile"
                  element={
                      <ProtectedRoute>
                          <ProfilePage />
                      </ProtectedRoute>
                  }
              />
              <Route
                  path="/help"
                  element={
                      <ProtectedRoute>
                          <HelpPage />
                      </ProtectedRoute>
                  }
              />
              <Route
                  path="/notifications"
                  element={
                      <ProtectedRoute>
                          <NotificationsPage />
                      </ProtectedRoute>
                  }
              />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />

        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
