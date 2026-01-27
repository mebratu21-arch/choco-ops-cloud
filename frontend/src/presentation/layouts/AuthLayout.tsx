import { Outlet } from 'react-router-dom';
import { Factory } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-sm space-y-6">
           <div className="flex items-center gap-2 mb-8">
              <div className="h-10 w-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                <Factory className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-secondary-900">ChocoOps</span>
           </div>
           <Outlet />
        </div>
      </div>
      <div className="hidden lg:flex flex-col items-center justify-center bg-secondary-900 p-12 text-white relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-tr from-primary-900 to-secondary-900 opacity-90"></div>
         <div className="relative z-10 max-w-lg text-center space-y-6">
            <h1 className="text-4xl font-bold tracking-tight">Manage Your Production with Precision</h1>
            <p className="text-lg text-secondary-300">
               Streamline your chocolate factory operations with real-time inventory tracking, AI-powered insights, and seamless production management.
            </p>
         </div>
         {/* Decorative Rings */}
         <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full border border-white/10 opacity-50 blur-3xl"></div>
         <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full border border-primary-500/20 opacity-50 blur-3xl"></div>
      </div>
    </div>
  );
}
