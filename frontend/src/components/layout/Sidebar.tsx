import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  Factory, 
  ShoppingCart, 
  Wrench, 
  ClipboardCheck, 
  Settings,
  Bot,
  Clipboard
} from 'lucide-react';
import { cn } from '../../lib/utils';

import { useLogFix } from '../../services/mechanicService';
import { toast } from 'sonner';

const SOSButton = () => {
    const { mutate: logFix, isPending } = useLogFix();

    const handleSOS = () => {
        logFix({
            machine_name: 'GENERAL_EMERGENCY',
            description: 'SOS BUTTON TRIGGERED',
            priority: 'URGENT'
        }, {
            onSuccess: () => {
                toast.error('SOS SIGNAL SENT - HELP IS ON THE WAY', {
                    duration: 5000,
                    style: { background: '#ef4444', color: 'white', fontWeight: 'bold' }
                });
            },
            onError: () => {
                toast.error('SOS FAILED - CALL MANAGER IMMEDIATELY');
            }
        });
    };

    return (
        <button
            onClick={handleSOS}
            disabled={isPending}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-bold shadow-lg shadow-red-900/20 animate-pulse disabled:opacity-50"
        >
            <div className="h-2 w-2 bg-white rounded-full animate-ping"></div>
            {isPending ? 'SENDING SIGNAL...' : 'SOS EMERGENCY'}
        </button>
    );
};

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role;

  // Normalize role check for case-insensitive comparison
  const hasRole = (allowedRoles: string[]) => {
      if (!role) return false;
      return allowedRoles.some(r => r.toUpperCase() === role.toUpperCase());
  };

  const links = [
    // Core Dashboards
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['MANAGER', 'WAREHOUSE', 'PRODUCTION', 'MECHANIC', 'QC', 'ADMIN'] },
    
    // Core Modules
    { to: '/inventory', label: 'Inventory (Warehouse)', icon: Package, roles: ['MANAGER', 'WAREHOUSE', 'ADMIN'] },
    { to: '/production', label: 'Production Line', icon: Factory, roles: ['MANAGER', 'PRODUCTION', 'ADMIN'] },
    { to: '/qc', label: 'Quality Control', icon: ClipboardCheck, roles: ['MANAGER', 'QC', 'ADMIN'] },
    { to: '/mechanics', label: 'Maintenance', icon: Wrench, roles: ['MANAGER', 'MECHANIC', 'ADMIN'] },
    
    // New Feature Modules
    { to: '/sales', label: 'External Sales', icon: ShoppingCart, roles: ['MANAGER', 'WAREHOUSE', 'ADMIN'] },
    { to: '/shop', label: 'Staff Shop', icon: ShoppingCart, roles: ['MANAGER', 'PRODUCTION', 'WAREHOUSE', 'QC', 'MECHANIC', 'ADMIN'] }, // Everyone
    { to: '/recipes', label: 'Recipe Book', icon: Clipboard, roles: ['MANAGER', 'PRODUCTION', 'ADMIN'] },

    // Admin
    { to: '/admin', label: 'Admin Panel', icon: Settings, roles: ['ADMIN'] },
    
    // Tools
    { to: '/ai-chat', label: 'AI Assistant', icon: Bot, roles: ['MANAGER', 'ADMIN', 'QC', 'MECHANIC'] },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col fixed left-0 top-0 z-40 font-sans">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gold-500 flex items-center gap-2 font-serif">
          <Factory className="h-8 w-8" />
          ChocoOps
        </h1>
        <p className="text-xs text-slate-400 mt-1">Chocolate Factory System</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {links.map((link) => {
          if (!hasRole(link.roles)) return null;
          
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive 
                    ? "bg-gold-600 text-white shadow-lg shadow-gold-900/20" 
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )
              }
            >
              <link.icon className="h-5 w-5" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="px-4 mb-4">
        <SOSButton />
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4">
          <div className="h-8 w-8 rounded-full bg-gold-500 flex items-center justify-center text-white font-bold">
            {(user?.username || user?.full_name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.full_name || user?.username || 'User'}</p>
            <p className="text-xs text-slate-400 truncate uppercase">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
