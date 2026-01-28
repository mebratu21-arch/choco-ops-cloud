import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { BarChart, Package, AlertTriangle, TrendingUp, Activity, CheckCircle, Clock } from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import { Ingredient } from '../../types';

// Premium Stat Card with Glassmorphism
const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <div className="relative overflow-hidden rounded-xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:scale-[1.02] hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900/50">
    <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${color} opacity-10 blur-2xl`}></div>
    <div className="flex items-center justify-between">
      <div className={`rounded-lg p-3 ${color} bg-opacity-10 backdrop-blur-sm`}>
        <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      {trend && (
        <span className="flex items-center text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
          +12% <TrendingUp className="ml-1 h-3 w-3" />
        </span>
      )}
    </div>
    <div className="mt-4">
      <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</h3>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
    </div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [lowStockCount, setLowStockCount] = useState(0);
  const [totalInventory, setTotalInventory] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Production Data
        // Ideally backend should provide a wrapper, but we filter client side for now
        // Assuming getAllBatches exists or we use recipes as proxy for activity
        // Real Inventory Data
        const ingredients = await inventoryService.getIngredients();
        setTotalInventory(ingredients.length);
        setLowStockCount(ingredients.filter((i: Ingredient) => i.current_stock <= i.minimum_stock).length);
      } catch (error) {
        console.error("Dashboard data fetch error", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8 p-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
            Welcome back, {user?.name || 'Admin'}
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            Here's what's happening in your facility today.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 shadow-sm">
           <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
           <span className="text-sm font-medium text-green-700">System Operational</span>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
            title="Total Products" 
            value={totalInventory} 
            icon={Package} 
            color="bg-blue-500" 
            trend 
        />
        <StatCard 
            title="Active Batches" 
            value="3" // From Seed
            icon={Activity} 
            color="bg-indigo-500" 
        />
        <StatCard 
            title="Low Stock Alerts" 
            value={lowStockCount} 
            icon={AlertTriangle} 
            color="bg-amber-500" 
        />
        <StatCard 
            title="Efficiency Score" 
            value="98%" 
            icon={CheckCircle} 
            color="bg-emerald-500" 
            trend
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart Area */}
        <Card className="col-span-4 border-none shadow-xl bg-white/60 backdrop-blur-xl dark:bg-slate-900/60">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-indigo-500" />
                    Production Volume
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] flex items-center justify-center rounded-xl bg-gradient-to-b from-slate-50/50 to-slate-100/50 border border-slate-100">
                    <p className="text-slate-400 font-medium">Production Analytics Visualization</p>
                    {/* Recharts would go here */}
                </div>
            </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="col-span-3 border-none shadow-xl bg-white/60 backdrop-blur-xl dark:bg-slate-900/60">
             <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    Live Activity Feed
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                    {[
                        { title: 'New Batch Started', desc: 'Dark Chocolate 70% - Batch #B-2026-002', time: '10 mins ago', color: 'bg-indigo-500' },
                        { title: 'Quality Check Passed', desc: 'Batch #B-2026-001 approved by QC', time: '2 hours ago', color: 'bg-emerald-500' },
                        { title: 'Inventory Alert', desc: 'Cocoa Butter below threshold', time: '4 hours ago', color: 'bg-amber-500' },
                    ].map((item, i) => (
                        <div key={i} className="relative flex items-start group">
                             <div className={`absolute left-0 h-10 w-10 flex items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm z-10 transition-transform group-hover:scale-110`}>
                                <div className={`h-3 w-3 rounded-full ${item.color}`}></div>
                             </div>
                            <div className="ml-16 rounded-xl bg-white p-4 shadow-sm border border-slate-100 transition-all hover:shadow-md hover:border-slate-200 w-full">
                                <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                                <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                                <span className="text-xs text-slate-400 mt-2 block">{item.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
