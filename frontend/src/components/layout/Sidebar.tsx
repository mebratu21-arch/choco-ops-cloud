import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Scroll,
  Factory,
  ClipboardCheck,
  Wrench,
  AlertTriangle,
  Hammer,
  Megaphone,
  CheckSquare,
  Bot,
  LogOut,
  Users,
  DollarSign,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';
import { cn } from '../../lib/utils';
import * as AuthUtils from '../../lib/auth-utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: UserRole[];
  badge?: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      {
        label: 'Overview',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'Admin Command',
    items: [
      {
        label: 'Admin Portal',
        href: '/admin/dashboard',
        icon: ShieldAlert,
        roles: ['admin', 'ADMIN'],
      },
      {
        label: 'User Management',
        href: '/users',
        icon: Users,
        roles: ['admin', 'ADMIN'],
      },
    ],
  },
  {
    title: 'Operations',
    items: [
      {
        label: 'Factory Boutique',
        href: '/inventory',
        icon: Package,
        roles: ['admin', 'manager', 'warehouse_worker', 'ADMIN'],
      },
      {
        label: 'Recipes',
        href: '/recipes',
        icon: Scroll,
        roles: ['admin', 'manager', 'production_worker', 'quality_controller', 'ADMIN'],
      },
      {
        label: 'Production Batches',
        href: '/batches',
        icon: Factory,
        roles: ['admin', 'manager', 'production_worker', 'ADMIN'],
      },
      {
        label: 'Quality Control',
        href: '/qc',
        icon: ClipboardCheck,
        roles: ['admin', 'manager', 'quality_controller', 'ADMIN'],
      },
    ],
  },
  {
    title: 'Maintenance',
    items: [
      {
        label: 'Machines',
        href: '/machines',
        icon: Wrench,
        roles: ['admin', 'manager', 'mechanic', 'ADMIN'],
      },
      {
        label: 'SOS Alerts',
        href: '/sos',
        icon: AlertTriangle,
        roles: ['admin', 'manager', 'mechanic', 'ADMIN'],
        badge: 'urgent',
      },
      {
        label: 'Maintenance Logs',
        href: '/maintenance',
        icon: Hammer,
        roles: ['admin', 'manager', 'mechanic', 'ADMIN'],
      },
    ],
  },
  {
    title: 'Management',
    items: [
      {
        label: 'Announcements',
        href: '/announcements',
        icon: Megaphone,
        roles: ['admin', 'manager', 'ADMIN'],
      },
      {
        label: 'Sales Command',
        href: '/sales',
        icon: DollarSign,
        roles: ['admin', 'manager', 'ADMIN'],
      },
      {
        label: 'My Tasks',
        href: '/tasks',
        icon: CheckSquare,
      },
    ],
  },
  {
    title: 'Tools',
    items: [
      {
        label: 'CocoaFlow AI',
        href: '/ai-assistant',
        icon: Bot,
      },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { useCurrentUser, useLogout } = useAuth();
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const location = useLocation();

  if (!user) return null;

  // Filter sections and items based on user role
  const filteredSections = NAV_SECTIONS.map(section => ({
    ...section,
    items: section.items.filter(item => {
      if (!item.roles) return true;
      // Use shared normalization to match backend roles to restricted frontend routes
      // Using namespace import to avoid potential HMR binding issues
      const userRole = AuthUtils.normalizeRole(user.role);
      // We also normalize the allowed roles list, just in case (though they should be strictly typed)
      const allowedRoles = item.roles.map(r => r.toLowerCase());
      
      // Check if the normalized user role is in the allowed list
      // Note: allowedRoles contains strict types like 'warehouse_worker'
      return allowedRoles.includes(userRole);
    }),
  })).filter(section => section.items.length > 0);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 w-80 bg-[#1A0C06] text-white z-50 transform transition-transform duration-500 ease-out md:translate-x-0 border-r border-white/5 shadow-2xl overflow-hidden",
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo Section - Matching Reference */}
          <div className="p-8 pb-10 flex flex-col gap-1">
            <Link to="/dashboard" className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-[#F4B400] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <span className="text-[#1A0C06] font-black text-2xl select-none">C</span>
              </div>
              <h2 className="font-black text-2xl tracking-tight text-white">
                CocoaFlow <span className="text-[#F4B400]">AI</span>
              </h2>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto py-2 scrollbar-hide">
            <nav className="space-y-6 px-4">
              {filteredSections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="space-y-1">
                  {section.title && (
                    <h3 className="px-5 py-2 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
                      {section.title}
                    </h3>
                  )}
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.href ||
                      location.pathname.startsWith(`${item.href}/`);

                    return (
                      <NavLink
                        key={item.href}
                        to={item.href}
                        onClick={() => {
                          if (window.innerWidth < 768) {
                            onClose();
                          }
                        }}
                        className={cn(
                          "flex items-center gap-4 px-5 py-4 rounded-xl text-[14px] font-bold transition-all duration-300 group relative",
                          isActive
                            ? "bg-[#33251D] text-white shadow-inner"
                            : "text-[#8D7B72] hover:text-white hover:bg-white/5"
                        )}
                      >
                        <item.icon className={cn(
                          "w-5 h-5 transition-colors duration-300",
                          isActive ? "text-[#F4B400]" : "text-[#8D7B72] group-hover:text-white"
                        )} />
                        <span className="flex-1 tracking-tight">{item.label}</span>
                        
                        {item.badge === 'urgent' && (
                          <div className="h-2 w-2 rounded-full bg-[#EA4335] shadow-[0_0_8px_#EA4335]" />
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>

          {/* User Profile Section - Strictly Bottom Aligned */}
          <div className="mt-auto border-t border-white/5 bg-[#1A0C06] p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-[#F4B400] flex items-center justify-center font-black text-[#1A0C06] text-xl shadow-lg">
                   {user?.full_name?.charAt(0).toUpperCase() ?? 'U'}
                </div>
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#34A853] border-2 border-[#1A0C06]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white leading-tight truncate uppercase tracking-tight">
                  {user?.full_name ?? 'System User'}
                </p>
                <p className="text-[10px] text-[#8D7B72] truncate mt-1 font-black tracking-widest uppercase">
                  {user?.role?.replace('_', ' ') ?? 'STAFF'}
                </p>
              </div>
            </div>

            <button 
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black text-[#8D7B72] hover:text-white hover:bg-white/5 border border-white/5 transition-all duration-300 uppercase tracking-widest group"
            >
              <LogOut className="w-4 h-4 group-hover:text-[#EA4335] transition-colors" />
              <span>Disconnect</span>
            </button>

            <div className="flex items-center justify-between text-[8px] font-black tracking-[0.2em] text-[#33251D] pt-2">
                <span>COCOAFLOW_SYS_V4.2</span>
                <div className="flex items-center gap-1.5 font-bold">
                    <div className="h-1 w-1 rounded-full bg-[#34A853]" />
                    <span>NEON CLOUD READY</span>
                </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
