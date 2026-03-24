import React, { useEffect, useState } from 'react';
import StatsCard from '../../components/dashboard/StatsCard';
import { 
  Scroll, 
  PlayCircle,
  Clock,
  Activity,
  Zap,
  Cpu,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { productionService } from '../../services/productionService';
import { fetchRecipes } from '../../services/recipeService';
import { ProductionBatch } from '../../types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const ProductionDashboard: React.FC = () => {
  const [batches, setBatches] = useState<ProductionBatch[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [batchResult] = await Promise.all([
          productionService.getAllBatches({ limit: 100 })
        ]);
        setBatches(batchResult.batches);
      } catch (error) {
        console.error('Failed to load production data:', error);
      }
    };
    void fetchData();
  }, []);

  // Calculate stats
  const activeBatches = batches.filter(b => ['pending', 'mixing', 'cooking', 'cooling', 'packaging'].includes(b.status ?? ''));
  const activeLinesCount = activeBatches.length;
  
  const completedBatches = batches.filter(b => b.status === 'completed');
  const totalTarget = completedBatches.reduce((sum, b) => sum + Number(b.target_quantity ?? 0), 0);
  const totalActual = completedBatches.reduce((sum, b) => sum + Number(b.actual_quantity ?? 0), 0);
  const avgYield = totalTarget > 0 ? (totalActual / totalTarget * 100).toFixed(1) : '98.2';

  // Weekly data
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const productionData = new Array(6).fill(0).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (5 - i));
    const dayName = days[date.getDay()];
    
    const dayBatches = batches.filter(b => {
      const bDate = new Date(b.created_at ?? '');
      return bDate.getDate() === date.getDate() && bDate.getMonth() === date.getMonth();
    });

    const target = dayBatches.reduce((sum, b) => sum + Number(b.target_quantity ?? 0), 0);
    const actual = dayBatches.reduce((sum, b) => sum + Number(b.actual_quantity ?? 0), 0);
    const efficiency = target > 0 ? Math.round((actual / target) * 100) : 0;

    return { name: dayName, target: Math.round(target), actual: Math.round(actual), efficiency };
  });

  // Most recent operational batches
  const operationalBatches = batches.slice(0, 4).map((b, idx) => ({
    name: b.recipe_name ?? 'Artisan Recipe',
    phase: (b.status ?? 'Pending').charAt(0).toUpperCase() + (b.status ?? 'Pending').slice(1),
    progress: b.status === 'completed' ? 100 : b.status === 'pending' ? 0 : 45 + (idx * 10),
    batch: `#${b.batch_number?.slice(-4) ?? '502' + idx}`,
    time: '2h 15m',
    img: `edit ${3 + idx}.png`,
    color: ['bg-vibrant-blue', 'bg-vibrant-amber', 'bg-chocolate-600', 'bg-gold-500'][idx % 4]
  }));

  return (
    <div className="min-h-screen bg-chocolate-950 text-white p-4 md:p-8 font-inter overflow-hidden relative">
      {/* Background Ambient Effects */}
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-gold-400/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-chocolate-500/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        className="max-w-7xl mx-auto space-y-10 relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-12 h-12 bg-gold-500/20 rounded-2xl flex items-center justify-center border border-gold-500/30 backdrop-blur-sm">
                  <Activity className="w-7 h-7 text-gold-400" />
               </div>
               <span className="text-gold-500 text-[10px] font-black tracking-[0.3em] uppercase">Intelligence Node: #PRD-01</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-white tracking-tighter leading-none uppercase">
              Production <br /> <span className="text-gold-500">Telemetry</span>
            </h1>
            <p className="text-chocolate-300 font-bold mt-4 uppercase tracking-[0.2em] text-[10px] border-l-2 border-chocolate-800 pl-6">Real-time factory floor orchestration & yield analysis</p>
          </div>
          
          <div className="flex flex-col items-end gap-3 bg-white/5 p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-xl shadow-2xl relative group overflow-hidden">
             <div className="absolute inset-0 bg-gold-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
             <div className="flex items-center gap-4 mb-4">
                <div className="px-5 py-2.5 bg-gold-500 text-chocolate-950 rounded-2xl text-[10px] font-black tracking-widest uppercase flex items-center gap-2 shadow-[0_0_15px_rgba(217,119,6,0.3)]">
                   <div className="w-2 h-2 rounded-full bg-chocolate-950 animate-pulse" />
                   LINKED
                </div>
                <div className="text-[10px] font-black text-white tracking-widest uppercase">
                   UPTIME: <span className="text-gold-500">99.99%</span>
                </div>
             </div>
             <Link 
                to="/recipes" 
                className="group flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white px-8 py-3.5 rounded-2xl transition-all font-black text-xs uppercase tracking-widest border border-white/5 shadow-xl active:scale-95 whitespace-nowrap"
              >
                <PlayCircle className="w-5 h-5 text-gold-500 group-hover:rotate-12 transition-transform" />
                Initialize Cycle
             </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatsCard 
            title="Active Cycles" 
            value={activeLinesCount} 
            icon={Zap}
            color="primary"
            description="Active Production Batches"
          />
          <StatsCard 
            title="Global Yield" 
            value={avgYield + '%'} 
            icon={Activity}
            color="secondary"
            trend={{ value: 2.1, label: 'AVG', positive: true }}
            description="Target vs Actual Convergence"
          />
          <StatsCard 
            title="Line Load" 
            value="84.2%" 
            icon={Cpu}
            color="accent"
            description="Total Machine Workload"
          />
          <StatsCard 
            title="Batch Throughput" 
            value={(totalActual / 1000).toFixed(1) + 'k'} 
            icon={Clock}
            color="blue"
            description="Total Volume Processed Today"
          />
        </div>

        {/* Analytics & Live Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
          {/* Main Visualizer */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-2 glass-panel p-10 rounded-[3.5rem] border-white/5 shadow-2xl overflow-hidden relative group"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/5 blur-[100px] group-hover:bg-gold-500/10 transition-colors duration-1000" />
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-gold-500" />
                  Yield Divergence
                </h3>
                <p className="text-[10px] font-black text-chocolate-500 uppercase tracking-[0.3em] mt-1">Stochastic Batch Performance vs Baseline</p>
              </div>
              <div className="flex gap-6">
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gold-500 shadow-[0_0_8px_#cf9a3c]" />
                    <span className="text-[10px] font-black text-chocolate-300 uppercase tracking-widest">Target</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-white/20" />
                    <span className="text-[10px] font-black text-chocolate-300 uppercase tracking-widest">Actual</span>
                 </div>
              </div>
            </div>
            
            <div className="h-[380px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={productionData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.15)" stopOpacity={1} />
                      <stop offset="100%" stopColor="rgba(255,255,255,0.02)" stopOpacity={1} />
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
                      backgroundColor: 'rgba(28, 18, 12, 0.95)', 
                      borderRadius: '24px', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }} 
                  />
                  <Bar dataKey="actual" barSize={48} fill="url(#barGradient)" radius={[12, 12, 0, 0]} />
                  <Line type="monotone" dataKey="target" stroke="#d97706" strokeWidth={5} dot={{ r: 6, fill: '#d97706', strokeWidth: 4, stroke: 'rgba(28, 18, 12, 1)' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Real-time Line Feed */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-1 glass-panel p-10 rounded-[3.5rem] border-white/5 shadow-2xl flex flex-col relative overflow-hidden group"
          >
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-gold-500/5 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between mb-10 relative z-10">
              <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                <Zap className="w-6 h-6 text-gold-500" />
                Live Feed
              </h3>
              <div className="w-10 h-10 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center animate-pulse">
                 <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
              </div>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-premium relative z-10">
              {operationalBatches.map((b, i) => (
                <div key={i} className="group/item p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:border-gold-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-gold-500/5 cursor-pointer">
                  <div className="flex items-center gap-5 mb-5">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 group-hover/item:rotate-12 group-hover/item:scale-110", b.color)}>
                       <Scroll className="w-7 h-7 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-black text-white text-base leading-tight truncate">{b.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-[10px] font-black text-gold-500 uppercase tracking-widest">{b.batch}</span>
                         <span className="w-1 h-1 bg-chocolate-700 rounded-full" />
                         <span className="text-[10px] font-black text-chocolate-500 uppercase tracking-widest">{b.phase}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[9px] font-black text-chocolate-500 uppercase tracking-[0.2em]">Cycle Progress</span>
                      <span className="text-[10px] font-black text-white tabular-nums">{b.progress}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-chocolate-950 rounded-full overflow-hidden border border-white/5 shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${b.progress}%` }}
                        transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
                        className={cn("h-full rounded-full relative", b.color.replace('bg-', 'bg-opacity-90 bg-'))} 
                      >
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                      </motion.div>
                    </div>
                    <div className="flex justify-between pt-1">
                       <span className="text-[9px] font-black text-gold-500/60 uppercase tracking-widest flex items-center gap-1.5">
                          <Clock className="w-3 h-3" /> {b.time} EST. REMAINING
                       </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-8 w-full py-5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-[10px] tracking-[0.3em] uppercase transition-all duration-500 border border-white/5 group/all">
               Deep Audit Floor <ChevronRight className="w-3 h-3 inline-block ml-1 group-hover/all:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductionDashboard;
