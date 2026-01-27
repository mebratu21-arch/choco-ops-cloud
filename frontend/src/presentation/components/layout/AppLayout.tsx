import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '../../lib/utils';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-secondary-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300",
        "md:ml-64"
      )}>
        <div className="md:hidden p-4 bg-white border-b border-secondary-200 flex items-center gap-4">
             <button 
               onClick={() => setSidebarOpen(true)} 
               className="p-2 hover:bg-secondary-50 rounded-lg text-secondary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
             >
                <Menu size={24} />
             </button>
             <span className="font-bold text-lg text-secondary-900">ChocoOps</span>
        </div>

        <div className="hidden md:block">
           <Header />
        </div>
        
        <main className="flex-1 p-4 md:p-8 animate-fade-in w-full max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
