import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { Loader } from './components/ui/Loader';
import { Toaster } from 'sonner';

// Auth pages - loaded immediately
import LoginPage from './pages/auth/LoginPage';
import DashboardSelector from './pages/dashboard/DashboardSelector';


// Lazy-loaded pages for code splitting
const InventoryPage = lazy(() => import('./pages/inventory/InventoryPage'));
const ProductionPage = lazy(() => import('./pages/production/ProductionPage'));
const ProductionBatchPage = lazy(() => import('./pages/production/ProductionBatchPage'));
const SalesPage = lazy(() => import('./pages/sales/SalesPage'));
const MechanicPage = lazy(() => import('./pages/mechanics/MechanicPage'));
const MechanicDashboardPage = lazy(() => import('./pages/mechanic/MechanicDashboardPage'));
const QCPage = lazy(() => import('./pages/qc/QCPage'));
const QCDashboardPage = lazy(() => import('./pages/qc/QCDashboardPage'));
const RecipeList = lazy(() => import('./pages/recipes/RecipeList'));
const RecipeDetails = lazy(() => import('./pages/recipes/RecipeDetails'));
const CreateRecipe = lazy(() => import('./pages/recipes/CreateRecipe'));
const ShopCatalog = lazy(() => import('./pages/shop/ShopCatalog'));
const ProductDetails = lazy(() => import('./pages/shop/ProductDetails'));
const Orders = lazy(() => import('./pages/shop/Orders'));
const ManagerDashboardPage = lazy(() => import('./pages/manager/ManagerDashboardPage'));
const AIChat = lazy(() => import('./components/ai/AIChat'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminAIDashboard = lazy(() => import('./pages/admin/AdminAIDashboard'));
const TranslationDemoPage = lazy(() => import('./pages/demo/TranslationDemoPage'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader size="lg" text="Loading..." />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Base Layout - Checks Authentication */}
        <Route element={<Layout />}>
           <Route path="/" element={<DashboardSelector />} />
           
           {/* Role Protected Routes with Code Splitting */}
           <Route element={<ProtectedRoute allowedRoles={['MANAGER', 'WAREHOUSE', 'ADMIN']} />}>
              <Route path="/inventory" element={<Suspense fallback={<PageLoader />}><InventoryPage /></Suspense>} />
              <Route path="/sales" element={<Suspense fallback={<PageLoader />}><SalesPage /></Suspense>} />
           </Route>

           <Route element={<ProtectedRoute allowedRoles={['MANAGER', 'PRODUCTION', 'ADMIN']} />}>
              <Route path="/production" element={<Suspense fallback={<PageLoader />}><ProductionPage /></Suspense>} />
              <Route path="/production/dashboard" element={<Suspense fallback={<PageLoader />}><ProductionPage /></Suspense>} />
              <Route path="/production/batch" element={<Suspense fallback={<PageLoader />}><ProductionBatchPage /></Suspense>} />
              
              <Route path="/recipes" element={<Suspense fallback={<PageLoader />}><RecipeList /></Suspense>} />
              <Route path="/recipes/new" element={<Suspense fallback={<PageLoader />}><CreateRecipe /></Suspense>} />
              <Route path="/recipes/:id" element={<Suspense fallback={<PageLoader />}><RecipeDetails /></Suspense>} />
           </Route>

           <Route element={<ProtectedRoute allowedRoles={['MANAGER', 'MECHANIC', 'ADMIN']} />}>
              <Route path="/mechanics" element={<Suspense fallback={<PageLoader />}><MechanicPage /></Suspense>} />
              <Route path="/mechanic/dashboard" element={<Suspense fallback={<PageLoader />}><MechanicDashboardPage /></Suspense>} />
           </Route>

           {/* Shop Module (Internal) */}
           <Route element={<ProtectedRoute allowedRoles={['MANAGER', 'PRODUCTION', 'WAREHOUSE', 'QC', 'MECHANIC', 'ADMIN']} />}>
              <Route path="/shop" element={<Suspense fallback={<PageLoader />}><ShopCatalog /></Suspense>} />
              <Route path="/shop/orders" element={<Suspense fallback={<PageLoader />}><Orders /></Suspense>} />
              <Route path="/shop/product/:id" element={<Suspense fallback={<PageLoader />}><ProductDetails /></Suspense>} />
           </Route>

           <Route element={<ProtectedRoute allowedRoles={['MANAGER', 'QC', 'ADMIN']} />}>
              <Route path="/qc" element={<Suspense fallback={<PageLoader />}><QCPage /></Suspense>} />
              <Route path="/qc/dashboard" element={<Suspense fallback={<PageLoader />}><QCDashboardPage /></Suspense>} />
           </Route>

           <Route element={<ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']} />}>
              <Route path="/manager/dashboard" element={<Suspense fallback={<PageLoader />}><ManagerDashboardPage /></Suspense>} />
           </Route>

           {/* AI Chat accessible to all authenticated users */}
           <Route path="/ai-chat" element={<Suspense fallback={<PageLoader />}><AIChat /></Suspense>} />

           {/* Translation Demo - showcases Gemini translation features */}
           <Route path="/translation-demo" element={<Suspense fallback={<PageLoader />}><TranslationDemoPage /></Suspense>} />

           <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminDashboardPage /></Suspense>} />
              <Route path="/ai-dashboard" element={<Suspense fallback={<PageLoader />}><AdminAIDashboard /></Suspense>} />
           </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster position="top-right" richColors />
    </ErrorBoundary>
  );
}

export default App;
