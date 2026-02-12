import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Bell,
  Search,
  User,
  LogOut,
  Candy,
  ChevronDown,
  Settings,
  HelpCircle,
  X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

interface NavbarProps {
  onMobileMenuToggle: () => void;
  notificationCount?: number;
}

const Navbar: React.FC<NavbarProps> = ({ onMobileMenuToggle, notificationCount = 0 }) => {
  const { useCurrentUser, useLogout } = useAuth();
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const navigate = useNavigate();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when mobile search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  // Capitalize role for display
  const displayRole = user?.role
    ? user.role.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : '';

  // Get user initials
  const userInitials = user?.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  // Get avatar color based on role
  const avatarColors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700 border-purple-200',
    manager: 'bg-blue-100 text-blue-700 border-blue-200',
    production_worker: 'bg-amber-100 text-amber-700 border-amber-200',
    warehouse_worker: 'bg-green-100 text-green-700 border-green-200',
    quality_controller: 'bg-teal-100 text-teal-700 border-teal-200',
    mechanic: 'bg-orange-100 text-orange-700 border-orange-200',
  };
  const avatarColor = avatarColors[user?.role ?? ''] ?? 'bg-cocoa-100 text-cocoa-700 border-cocoa-200';

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 md:left-80 h-16 bg-white/40 backdrop-blur-md z-[60] px-6 flex items-center justify-between border-b border-black/5 transition-all duration-300">
        {/* Left Side: Logo & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMobileMenuToggle}
            className="p-2.5 hover:bg-black/5 rounded-xl md:hidden text-chocolate-950 transition-all active:scale-95"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link to="/dashboard" className="flex items-center gap-3 group md:hidden">
            <div className="w-10 h-10 bg-[#F4B400] rounded-xl flex items-center justify-center text-[#1A0C06] shadow-lg group-hover:scale-105 transition-all duration-500">
              <Candy className="w-6 h-6" />
            </div>
            <div className="hidden sm:block">
              <span className="font-black text-xl tracking-tight text-chocolate-950">
                CocoaFlow <span className="text-[#F4B400]">AI</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Search (Floating Glass Design) */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-lg mx-12 relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-chocolate-900/30 group-focus-within:text-gold-500 transition-colors" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search archives, batches, inventory..."
            className="w-full pl-12 pr-4 py-2.5 bg-black/[0.03] border border-black/5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-gold-500/10 focus:border-gold-500/30 focus:bg-white transition-all text-sm font-medium text-chocolate-950 placeholder:text-chocolate-900/30 shadow-premium-in"
          />
        </form>

        {/* Right Side: Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2.5 hover:bg-black/5 rounded-xl text-chocolate-900 md:hidden transition-all active:scale-95"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <Link
            to="/notifications"
            className="p-2.5 relative hover:bg-black/5 rounded-xl text-chocolate-900 transition-all active:scale-95 group"
            aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ''}`}
          >
            <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            {notificationCount > 0 && (
              <span className="absolute top-2 right-2 min-w-[18px] h-[18px] flex items-center justify-center bg-vibrant-red text-white text-[9px] font-black rounded-full px-1 border-2 border-[#FDFCF0] shadow-glow">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </Link>

          {/* User Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={cn(
                "flex items-center gap-3 p-1.5 rounded-[1.25rem] border transition-all active:scale-95",
                isUserMenuOpen
                  ? "bg-white border-gold-500/30 shadow-lg"
                  : "border-transparent hover:bg-white hover:border-black/5 hover:shadow-premium-out"
              )}
              aria-expanded={isUserMenuOpen}
              aria-haspopup="true"
            >
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shadow-premium-in", avatarColor)}>
                {userInitials}
              </div>
              <div className="hidden text-left sm:block pr-1">
                <p className="text-xs font-black text-chocolate-950 uppercase tracking-tighter">
                  {user?.full_name?.split(' ')[0] ?? 'User'}
                </p>
                <p className="text-[9px] text-chocolate-900/40 font-black uppercase tracking-widest mt-0.5">
                  {user?.role?.split('_')[0]}
                </p>
              </div>
              <ChevronDown className={cn(
                "w-3.5 h-3.5 text-chocolate-900/20 hidden sm:block transition-transform",
                isUserMenuOpen && "rotate-180"
              )} />
            </button>

            {/* User Menu Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-cocoa-100 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-cocoa-50">
                  <p className="text-sm font-semibold text-cocoa-900">
                    {user?.full_name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {user?.email}
                  </p>
                  <span className={cn(
                    "inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium",
                    avatarColor
                  )}>
                    {displayRole}
                  </span>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-cocoa-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    My Profile
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-cocoa-50 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      Settings
                    </Link>
                  )}
                  <Link
                    to="/help"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-cocoa-50 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-slate-400" />
                    Help & Support
                  </Link>
                </div>

                {/* Logout */}
                <div className="pt-1 border-t border-cocoa-50">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-white md:hidden animate-in fade-in duration-200">
          <div className="flex items-center gap-3 p-4 border-b border-cocoa-100">
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-2 hover:bg-cocoa-50 rounded-lg text-cocoa-600"
            >
              <X className="w-5 h-5" />
            </button>
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2.5 border border-cocoa-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cocoa-500/20 focus:border-cocoa-400 bg-cocoa-50/50 text-sm"
              />
            </form>
          </div>
          {/* Search suggestions could go here */}
          <div className="p-4 text-center text-sm text-slate-500">
            Search for recipes, batches, inventory items...
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
