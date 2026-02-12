import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import AIWidget from '../ai/AIWidget';
import { cn } from '../../lib/utils';

interface DashboardLayoutProps {
  notificationCount?: number;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ notificationCount = 0 }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const location = useLocation();

  // Handle route changes: close sidebar and trigger transition
  const [prevPath, setPrevPath] = useState(location.pathname);
  
  if (location.pathname !== prevPath) {
    setPrevPath(location.pathname);
    setSidebarOpen(false);
    setIsPageTransitioning(true);
    setTimeout(() => setIsPageTransitioning(false), 150);
  }

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  return (
    <div className="min-h-screen bg-[#FDFCF0] relative overflow-x-hidden">
      {/* Micro-noise texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[1] mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3%3Cfilter id='noiseFilter'%3%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3%3C/filter%3%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3%3C/svg%3")` }}>
      </div>

      {/* Top Navigation Overlay Container (Glassmorphism) */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white/40 backdrop-blur-md z-40 border-b border-black/5" />

      {/* Top Navigation */}
      <Navbar
        onMobileMenuToggle={() => setSidebarOpen(!isSidebarOpen)}
        notificationCount={notificationCount}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main
        className={cn(
          "pt-16 md:pl-80 min-h-screen transition-all duration-300 flex flex-col relative z-0",
          isSidebarOpen && "md:pl-80"
        )}
      >
        {/* Soft radial highlight for depth */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-gold-400/5 blur-[120px] rounded-full pointer-events-none" />

        <div
          className={cn(
            "p-4 md:p-8 lg:p-12 max-w-[1400px] w-full mx-auto flex-1 relative z-10",
            "transition-all duration-300 ease-out",
            isPageTransitioning
              ? "opacity-0 translate-y-2"
              : "opacity-100 translate-y-0"
          )}
        >
          <Outlet />
        </div>

        {/* Global System Status Footer (Premium Aesthetic) */}
        <footer className="mt-auto bg-chocolate-950 text-white/40 px-8 py-6 flex flex-col md:flex-row items-center justify-between text-[10px] font-bold tracking-[0.25em] uppercase border-t border-white/5 relative z-10">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-vibrant-green animate-pulse shadow-[0_0_12px_#10b981]" />
              <span className="text-white/70 font-black">System Terminal Active</span>
            </div>
            <div className="hidden md:block w-[2px] h-4 bg-white/5" />
            <div className="hidden md:flex items-center gap-3">
              <span className="text-white/20">Sync Rate:</span>
              <span className="text-white/70">99.98%</span>
            </div>
          </div>
          
          <div className="mt-6 md:mt-0 flex items-center gap-8">
            <div className="flex items-center gap-2 text-gold-500/40">
              <div className="w-1 h-1 rounded-full bg-gold-500/40" />
              <span>Secure Layer 4</span>
            </div>
            <div className="w-[2px] h-4 bg-white/5" />
            <span className="font-black text-white/50">&copy; {new Date().getFullYear()} Coca-Archive</span>
          </div>
        </footer>

        {/* Floating AI Widget */}
        <AIWidget />
      </main>
    </div>
  );
};

export default DashboardLayout;
