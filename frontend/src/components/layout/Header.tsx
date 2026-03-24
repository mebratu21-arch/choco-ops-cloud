import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Bell, LogOut } from 'lucide-react';

const Header = () => {
  const { logout, user } = useAuth();

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-30 ml-64">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">
          Welcome back, {user?.username}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5 text-slate-600" />
        </Button>
        
        <Button 
          variant="outline" 
          onClick={logout}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
};

export default Header;
