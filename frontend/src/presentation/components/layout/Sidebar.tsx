import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Factory, MessageSquare, LogOut, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
  { icon: Package, label: 'Inventory', to: '/inventory' },
  { icon: Factory, label: 'Production', to: '/production' },
  { icon: BookOpen, label: 'Recipes', to: '/recipes' },
  { icon: ShoppingCart, label: 'Orders', to: '/orders' },
  { icon: ShieldCheck, label: 'Quality Control', to: '/quality' },
  { icon: Wrench, label: 'Mechanics', to: '/mechanics' },
  { icon: Cpu, label: 'AI Dashboard', to: '/admin-ai' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-40 w-64 border-r border-secondary-200 bg-white transition-transform duration-300 md:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex h-16 items-center border-b border-secondary-200 px-6">
        <div className="flex items-center gap-2">
           <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
             <Factory className="h-5 w-5 text-white" />
           </div>
           <span className="text-xl font-bold text-secondary-900">ChocoOps</span>
        </div>
      </div>

      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-4 left-0 w-full px-4">
          <div className="mb-2">
             <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900 transition-all">
                <Settings className="h-5 w-5" />
                Settings
             </button>
          </div>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-all font-medium"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
      </div>
    </aside>
  );
}
