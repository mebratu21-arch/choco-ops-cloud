import React from 'react';
import PageHeader from '../../components/layout/PageHeader';
import { toast } from 'sonner';
import StatsCard from '../../components/dashboard/StatsCard';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Users,
  Timer,
  Zap,
  ChevronRight,
  Activity
} from 'lucide-react';
import { useManager } from '../../hooks/useManager';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const MOCK_CHART_DATA = [
  { name: '08:00', value: 45 },
  { name: '10:00', value: 52 },
  { name: '12:00', value: 48 },
  { name: '14:00', value: 61 },
  { name: '16:00', value: 55 },
  { name: '18:00', value: 67 },
  { name: '20:00', value: 72 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const ManagerDashboard: React.FC = () => {
  const { useDashboardStats } = useManager();
  const { isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex bg-chocolate-950 h-screen items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-gold-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chocolate-950 text-white p-4 md:p-8 font-inter overflow-hidden relative">
      {/* Background Ambient Effects */}
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-gold-400/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-chocolate-500/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        className="max-w-7xl mx-auto space-y-12 relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
               <div className="w-12 h-12 bg-gold-500/20 rounded-2xl flex items-center justify-center border border-gold-500/30 backdrop-blur-sm">
                  <TrendingUp className="w-7 h-7 text-gold-400" />
               </div>
               <span className="text-gold-500 text-[10px] font-black tracking-[0.3em] uppercase">Executive Intelligence</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-white tracking-tighter leading-none uppercase">
              Strategic <br /> <span className="text-gold-500">Telemetry</span>
            </h1>
            <p className="text-chocolate-300 font-bold mt-4 uppercase tracking-[0.2em] text-[10px] border-l-2 border-chocolate-800 pl-6">Global yields, workforce orchestration & critical path insights</p>
          </div>
          
          <div className="flex items-center gap-6 bg-white/5 p-4 rounded-[2.5rem] border border-white/5 shadow-2xl backdrop-blur-md relative group overflow-hidden">
             <div className="absolute inset-0 bg-gold-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 px-6 py-3 bg-gold-500 text-chocolate-950 rounded-2xl text-[10px] font-black tracking-[0.2em] shadow-[0_0_20px_rgba(217,119,6,0.3)]">
                   <div className="w-2 h-2 rounded-full bg-chocolate-950 animate-pulse shadow-[0_0_10px_rgba(0,0,0,0.2)]" />
                   LIVE SYSTEM
                </div>
                <div className="hidden lg:block text-[10px] font-black text-chocolate-400 tracking-widest uppercase pr-6">
                   Network Pulse: <span className="text-green-400">Stable</span>
                </div>
             </div>
          </div>
        </div>

        {/* Stats Grid */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" variants={itemVariants}>
          <StatsCard 
            title="System Productivity" 
            value="96.8%" 
            icon={TrendingUp}
            color="primary"
            trend={{ value: 0.8, label: 'FAC AVG', positive: true }}
            description="Global Yield Telemetry"
          />
          <StatsCard 
            title="Workforce Echo" 
            value="12/12" 
            icon={Users}
            color="secondary"
            trend={{ value: 0, label: 'Synced', positive: true }}
            description="Active Operator Nodes"
          />
          <StatsCard 
            title="Material Velocity" 
            value="84" 
            icon={Package}
            color="accent"
            trend={{ value: 12, label: 'Flow', positive: true }}
            description="Inventory Throttling Status"
          />
          <StatsCard 
            title="Alert Thresholds" 
            value="0" 
            icon={AlertTriangle}
            color="blue"
            description="Critical Path Incidents"
          />
        </motion.div>

        {/* Intelligence Quadrants */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
          {/* Output Analytics */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-2 glass-panel p-10 rounded-[3.5rem] border-white/5 shadow-2xl overflow-hidden relative group"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/5 blur-[120px] group-hover:bg-gold-500/10 transition-colors duration-1000" />
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-gold-500" />
                  Yield Convergence
                </h3>
                <p className="text-[10px] font-black text-chocolate-500 uppercase tracking-[0.3em] mt-1">Inter-batch accuracy & variance telemetry</p>
              </div>
              <div className="px-5 py-2.5 bg-white/5 rounded-2xl border border-white/5 text-[10px] font-black text-chocolate-300 tracking-[0.2em] uppercase">
                 Real-time Sync
              </div>
            </div>

            <div className="h-[380px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_CHART_DATA}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#7a6054', fontSize: 10, fontWeight: 900 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#7a6054', fontSize: 10, fontWeight: 900 }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(28, 18, 12, 0.98)', 
                      borderRadius: '24px', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
                      backdropFilter: 'blur(15px)'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#d97706" 
                    strokeWidth={5}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Critical Path Actions */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-1 glass-panel p-10 rounded-[3.5rem] border-white/5 shadow-2xl flex flex-col relative overflow-hidden group"
          >
             <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-gold-500/5 to-transparent pointer-events-none" />
             <div className="flex items-center justify-between mb-10 relative z-10">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                    <Zap className="w-6 h-6 text-gold-500" />
                    Hot-Path
                  </h3>
                  <p className="text-[10px] font-black text-chocolate-500 uppercase tracking-[0.3em] mt-1">Urgent operational directives</p>
                </div>
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                   <div className="relative">
                      <Timer className="w-6 h-6 text-gold-500" />
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                   </div>
                </div>
             </div>

             <div className="space-y-6 flex-1 relative z-10">
                {[
                  { title: 'Inventory Inflow', desc: 'Sync: Swiss Cocoa Supply', status: 'Optimal', icon: Package, color: 'text-gold-400' },
                  { title: 'Quality Echo', desc: 'Final Batch Calibration', status: 'Pending', icon: CheckCircle, color: 'text-chocolate-400' },
                  { title: 'Power Distribution', desc: 'Line 04 Peak-Load Check', status: 'Stable', icon: Activity, color: 'text-green-500' }
                ].map((action, i) => (
                  <div key={i} className="group/item flex items-center gap-5 p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:border-gold-500/40 transition-all duration-500 cursor-pointer hover:shadow-2xl hover:shadow-gold-500/5">
                     <div className="w-14 h-14 rounded-2xl bg-chocolate-950 border border-white/5 flex items-center justify-center group-hover/item:rotate-6 transition-all duration-500 shadow-xl">
                        <action.icon className={cn("w-7 h-7", action.color)} />
                     </div>
                     <div className="flex-1 min-w-0">
                        <h4 className="font-black text-white text-base leading-tight truncate">{action.title}</h4>
                        <p className="text-[10px] font-black text-chocolate-500 uppercase tracking-widest mt-1">{action.desc}</p>
                     </div>
                     <div className="flex flex-col items-end">
                        <span className={cn("text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full bg-white/10", action.color)}>
                           {action.status}
                        </span>
                        <ChevronRight className="w-4 h-4 text-chocolate-700 mt-2 group-hover/item:translate-x-1 transition-transform" />
                     </div>
                  </div>
                ))}
             </div>

             <button className="mt-10 w-full py-6 rounded-[2rem] bg-gold-500 hover:bg-gold-400 text-chocolate-950 font-black text-[10px] tracking-[0.4em] uppercase transition-all duration-700 shadow-2xl shadow-gold-500/20 active:scale-95 group/btn overflow-hidden relative">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                <span className="relative z-10">Initialize Force Sync</span>
             </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ManagerDashboard;
