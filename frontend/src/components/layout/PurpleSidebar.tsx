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
                toast.error('SOS SIGNAL SENT', { style: { background: '#ef4444', color: 'white' } });
            },
            onError: () => toast.error('SOS FAILED')
        });
    };

    return (
        <button
            onClick={handleSOS}
            disabled={isPending}
            className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-2 px-4 rounded-full flex items-center justify-center gap-2 font-bold shadow-md hover:shadow-lg transition-all text-xs tracking-wider"
        >
            <div className={`h-2 w-2 bg-white rounded-full ${isPending ? 'animate-ping' : ''}`}></div>
            {isPending ? 'SENDING...' : 'EMERGENCY SOS'}
        </button>
    );
};

const PurpleSidebar = () => {
  const { user } = useAuth();
  const role = user?.role;

  const hasRole = (allowedRoles: string[]) => {
      if (!role) return false;
      return allowedRoles.some(r => r.toUpperCase() === role.toUpperCase());
  };

  const links = [
    { to: '/', label: 'Admin Command Center', icon: LayoutDashboard, roles: ['MANAGER', 'WAREHOUSE', 'PRODUCTION', 'MECHANIC', 'QC', 'ADMIN'] },
    { to: '/inventory', label: 'Inventory (Basic UI)', icon: Package, roles: ['MANAGER', 'WAREHOUSE'] },
    { to: '/production', label: 'Production (Forms)', icon: Factory, roles: ['MANAGER', 'PRODUCTION'] },
    { to: '/qc', label: 'Quality Control (Tables)', icon: ClipboardCheck, roles: ['MANAGER', 'QC'] },
    { to: '/mechanics', label: 'Maintenance (Icons)', icon: Wrench, roles: ['MANAGER', 'MECHANIC'] },
    { to: '/sales', label: 'Sales (Charts)', icon: ShoppingCart, roles: ['MANAGER', 'WAREHOUSE'] },
    { to: '/shop', label: 'Company Shop', icon: ShoppingCart, roles: ['MANAGER', 'PRODUCTION', 'WAREHOUSE', 'QC', 'MECHANIC', 'ADMIN'] },
    { to: '/recipes', label: 'Recipes', icon: Clipboard, roles: ['MANAGER', 'PRODUCTION'] },
    { to: '/admin', label: 'Admin Command Center', icon: Settings, roles: ['ADMIN'] },
    { to: '/ai-chat', label: 'AI Assistant', icon: Bot, roles: ['MANAGER', 'ADMIN', 'QC', 'MECHANIC'] },
  ];

  return (
    <aside className="w-64 bg-white min-h-screen flex flex-col fixed left-0 top-0 z-40 border-r border-gray-100 font-sans shadow-sm">
      {/* Brand Header */}
      <div className="h-[70px] flex items-center px-6 border-b border-gray-50">
        <div className="flex items-center gap-2 text-purple-theme-primary">
             {/* Logo Icon Mockup */}
             <div className="h-8 w-8 bg-purple-theme-primary rounded-md flex items-center justify-center text-white font-bold text-lg">P</div>
             <span className="text-2xl font-bold tracking-tight">Purple</span>
        </div>
      </div>

      {/* Profile Section (per image) */}
      <div className="px-6 py-6 pb-2">
         <div className="flex items-center gap-3 mb-6">
            <div className="relative">
                <img 
                  src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=b66dff&color=fff`} 
                  alt="profile" 
                  className="h-10 w-10 rounded-full border-2 border-purple-100"
                />
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
            <div>
                <h3 className="text-sm font-bold text-gray-700">{user?.name || 'David Grey. H'}</h3>
                <p className="text-xs text-gray-400">{user?.role || 'Project Manager'}</p>
            </div>
         </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2">
            <span className="text-xs font-bold text-purple-theme-primary uppercase tracking-wider">Main Menu</span>
        </div>
        
        {links.map((link) => {
          if (!hasRole(link.roles)) return null;
          
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-between px-3 py-3 rounded-tr-full rounded-br-full transition-all group",
                  isActive 
                    ? "bg-purple-50 text-purple-theme-primary font-semibold border-l-4 border-purple-theme-primary" 
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50 border-l-4 border-transparent"
                )
              }
            >
              <div className="flex items-center gap-3">
                  <div className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      // Add slight icon background like in image if active
                  )}>
                    <link.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm">{link.label}</span>
              </div>
              {/* Optional: Add collapse arrow or indicator if needed, sticking to minimal for now */}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer / SOS */}
      <div className="p-6 mt-auto">
        <SOSButton />
      </div>
    </aside>
  );
};

export default PurpleSidebar;
