import { useAuthStore } from '../../store/authStore';
import { 
  Search, 
  Bell, 
  Mail, 
  Menu, 
  Power,
  ChevronDown,
  LogOut,
  User as UserIcon,

} from 'lucide-react';
import { toast } from 'sonner';
import { useState, useRef, useEffect } from 'react';

const PurpleHeader = () => {
    const logout = useAuthStore(state => state.logout);
    const user = useAuthStore(state => state.user);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="h-[70px] bg-white border-b border-gray-100 flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-30 shadow-sm">
            {/* Left: Search & Toggle */}
            <div className="flex items-center gap-6 flex-1">
                <button 
                    onClick={() => toast.info('Sidebar toggle')}
                    className="text-gray-400 hover:text-purple-theme-primary transition-colors"
                >
                    <Menu className="h-6 w-6" />
                </button>
                
                <div className="relative w-full max-w-md hidden md:block">
                    <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search projects..." 
                        onKeyDown={(e) => e.key === 'Enter' && toast.success(`Searching for: ${e.currentTarget.value}`)}
                        className="pl-8 pr-4 py-2 w-full border-none focus:ring-0 text-sm text-gray-600 placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-6">




                 {/* Profile Dropdown Trigger */}
                 <div className="relative" ref={dropdownRef}>
                     <div 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors group select-none"
                     >
                        <div className="relative">
                            <img 
                                src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=b66dff&color=fff`} 
                                alt="profile" 
                                className="h-8 w-8 rounded-full"
                            />
                        </div>
                        <span className="text-sm font-medium text-gray-700 hidden lg:block group-hover:text-purple-theme-primary">
                            {user?.name || 'David Greymaax'}
                        </span>
                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                     </div>

                     {/* Dropdown Menu */}
                     {isProfileOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                             <div className="px-4 py-2 border-b border-gray-100 mb-1">
                                 <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                                 <p className="text-xs text-gray-500">{user?.role || 'Admin'}</p>
                             </div>
                             
                             <button 
                                onClick={() => {
                                    setIsProfileOpen(false);
                                    toast.info('Switch User feature coming soon!');
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-purple-50 hover:text-purple-theme-primary flex items-center gap-2"
                             >
                                 <UserIcon className="h-4 w-4" />
                                 Switch Account
                             </button>

                             <button 
                                onClick={logout}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                             >
                                 <LogOut className="h-4 w-4" />
                                 Logout
                             </button>
                        </div>
                     )}
                 </div>



                 {/* Icons */}
                 <div className="flex items-center gap-4 border-l border-gray-200 pl-6">
                    <button 
                        onClick={() => toast.info('No new messages')}
                        className="relative text-gray-400 hover:text-purple-theme-primary transition-colors"
                    >
                        <Mail className="h-5 w-5" />
                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-purple-theme-primary rounded-full border border-white"></span>
                    </button>
                    
                    <button 
                        onClick={() => toast.info('You have 3 unread alerts')}
                        className="relative text-gray-400 hover:text-purple-theme-primary transition-colors"
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
                    </button>

                    <button 
                        onClick={logout}
                        className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                        title="Logout"
                    >
                        <Power className="h-5 w-5" />
                    </button>
                 </div>
            </div>
        </header>
    );
};

export default PurpleHeader;
