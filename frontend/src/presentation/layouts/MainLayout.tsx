import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-secondary-50">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="container mx-auto p-6 animate-in fade-in duration-500">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
