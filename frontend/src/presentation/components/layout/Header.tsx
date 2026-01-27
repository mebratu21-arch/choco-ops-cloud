import { Bell, Search } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-secondary-200 bg-white/80 px-6 backdrop-blur-sm">
      <div className="flex w-full max-w-md items-center gap-4">
        <div className="relative w-full">
           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-secondary-500" />
           <input 
              type="text" 
              placeholder="Search anything..." 
              className="h-9 w-full rounded-md border border-secondary-200 bg-secondary-50 pl-9 pr-4 text-sm text-secondary-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
           />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 text-secondary-500 hover:bg-secondary-100 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
        <div className="h-8 w-px bg-secondary-200"></div>
        <div className="flex items-center gap-3">
           <div className="flex flex-col items-end">
               <span className="text-sm font-semibold text-secondary-900">John Doe</span>
               <span className="text-xs text-secondary-500">Production Mgr</span>
           </div>
           <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-bold border border-primary-200">
              JD
           </div>
        </div>
      </div>
    </header>
  );
}
