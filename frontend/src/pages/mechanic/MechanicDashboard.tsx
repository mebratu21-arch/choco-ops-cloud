import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench,
  AlertTriangle,
  Calendar,
  Settings,
  Activity,
  ChevronRight,
  Bell,
  Plus,
  Volume2,
  VolumeX,
  History,
  ShieldAlert,
  Thermometer,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '../../components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useMechanic } from '../../hooks/useMechanic';
import { useAuth } from '../../hooks/useAuth';
import MaintenanceLogModal from '../../components/mechanic/MaintenanceLogModal';
import SOSAlertCard from '../../components/mechanic/SOSAlertCard';
import ResolveAlertModal from '../../components/mechanic/ResolveAlertModal';
import { SOSAlert, Machine, MachineStatus, MaintenanceLog } from '../../types';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const HEALTH_DATA = [
  { time: '08:00', health: 98, temp: 42 },
  { time: '10:00', health: 95, temp: 45 },
  { time: '12:00', health: 92, temp: 58 },
  { time: '14:00', health: 88, temp: 65 },
  { time: '16:00', health: 85, temp: 72 },
  { time: '18:00', health: 89, temp: 60 },
];

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

const MechanicDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { useCurrentUser } = useAuth();
  const { data: user } = useCurrentUser();
  const { useMachines, useSOSAlerts, useMaintenanceLogs } = useMechanic();

  const { data: rawMachines = [], isLoading: machinesLoading } = useMachines();
  const machines = useMemo(() => Array.isArray(rawMachines) ? rawMachines : [], [rawMachines]);

  const { data: rawOpenAlerts = [], isLoading: alertsLoading, refetch: refetchAlerts } = useSOSAlerts({ status: 'open' });
  const openAlerts = useMemo(() => Array.isArray(rawOpenAlerts) ? rawOpenAlerts : [], [rawOpenAlerts]);
  
  const { data: rawInProgressAlerts = [] } = useSOSAlerts({ status: 'in_progress' });
  const inProgressAlerts = useMemo(() => Array.isArray(rawInProgressAlerts) ? rawInProgressAlerts : [], [rawInProgressAlerts]);
  
  const { data: rawMaintenanceLogs = [], isLoading: logsLoading } = useMaintenanceLogs({ limit: 5 });
  const maintenanceLogs = useMemo(() => Array.isArray(rawMaintenanceLogs) ? rawMaintenanceLogs : [], [rawMaintenanceLogs]);

  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<SOSAlert | null>(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [previousAlertCount, setPreviousAlertCount] = useState(0);

  const allActiveAlerts = useMemo(() => {
    return [...openAlerts, ...inProgressAlerts].sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      // @ts-ignore - Index signature for priorityOrder
      return (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99);
    });
  }, [openAlerts, inProgressAlerts]);

  useEffect(() => {
    const criticalCount = openAlerts.filter(a => a.priority === 'critical').length;
    if (soundEnabled && criticalCount > previousAlertCount) {
      // Audio file missing, disabled for now to prevent errors
      // const audio = new Audio('/sounds/alert.mp3');
      // audio.play().catch(() => {});
      console.log('Playing alert sound (simulated)');
      toast.error('New Critical Alert!', {
        description: 'A critical SOS alert requires immediate attention.',
        duration: 10000,
      });
    }
    setPreviousAlertCount(criticalCount);
  }, [openAlerts, soundEnabled, previousAlertCount]);

  useEffect(() => {
    const interval = setInterval(() => {
      void refetchAlerts();
    }, 10000);
    return () => clearInterval(interval);
  }, [refetchAlerts]);

  const operationalMachines = machines.filter((m: Machine) => m.status === 'operational').length;
  const maintenanceDueThisWeek = machines.filter((m: Machine) => {
    if (!m.next_maintenance_date) return false;
    const nextMaintenance = new Date(m.next_maintenance_date);
    const now = new Date();
    const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return nextMaintenance <= oneWeekLater && nextMaintenance >= now;
  }).length;

  const handleViewAlert = (alert: SOSAlert) => {
    setSelectedAlert(alert);
    setIsResolveModalOpen(true);
  };

  const handleAlertResolved = () => {
    setIsResolveModalOpen(false);
    setSelectedAlert(null);
    void refetchAlerts();
  };

  const getStatusColor = (status: MachineStatus) => {
    switch (status) {
      case 'operational': return 'bg-emerald-500';
      case 'maintenance': return 'bg-amber-500';
      case 'repair': return 'bg-rose-500';
      case 'offline': return 'bg-slate-500';
      case 'standby': return 'bg-sky-500';
      default: return 'bg-slate-400';
    }
  };

  const hasCriticalAlerts = Array.isArray(openAlerts) && openAlerts.some((a: SOSAlert) => a.priority === 'critical' || a.priority === 'high');

  return (
    <motion.div 
      className="space-y-8 pb-20"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <PageHeader
          title="Maintenance Command"
          subtitle={`Unit Diagnostics & Asset Orchestration for Lead Mechanic ${user?.full_name?.split(' ')[1] ?? ''}.`}
        />
        <div className="flex items-center gap-4 bg-white/70 backdrop-blur-xl p-3 rounded-[2rem] border border-chocolate-100 shadow-xl shadow-chocolate-200/10">
          <Button
            variant="ghost"
            className="w-14 h-14 rounded-2xl bg-white shadow-inner border border-chocolate-50 hover:bg-chocolate-50 transition-all duration-500 group"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? (
              <Volume2 className="w-6 h-6 text-chocolate-900 group-hover:scale-110 transition-transform" />
            ) : (
              <VolumeX className="w-6 h-6 text-slate-300" />
            )}
          </Button>
          <Button
            variant="default"
            onClick={() => navigate('/mechanic/alerts')}
            className="h-14 px-8 rounded-2xl bg-chocolate-950 text-white font-black hover:bg-chocolate-900 transition-all shadow-xl shadow-chocolate-200/20 gap-3 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gold-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <Bell className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform" />
            <span className="relative z-10 tracking-[0.1em]">LIVE ALERTS</span>
            {allActiveAlerts.length > 0 && (
              <span className="relative z-10 ml-2 px-3 py-1 bg-vibrant-amber text-chocolate-950 rounded-full text-[10px] font-black shadow-[0_0_10px_#f59e0b]">
                {allActiveAlerts.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {hasCriticalAlerts && (
        <motion.div 
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-vibrant-red rounded-[3rem] p-8 shadow-2xl relative overflow-hidden border-4 border-vibrant-red/50 group"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50 group-hover:scale-110 transition-transform duration-1000" />
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <ShieldAlert className="w-48 h-48 text-white group-hover:rotate-12 transition-transform duration-1000" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-8">
              <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-xl shadow-2xl ring-1 ring-white/30">
                <AlertTriangle className="w-10 h-10 text-white animate-pulse" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight uppercase">Emergency Response Vector</h2>
                <p className="text-white/80 font-bold uppercase tracking-widest text-xs mt-1">
                  {openAlerts.filter((a: SOSAlert) => a.priority === 'critical').length} Critical Faults • {openAlerts.filter((a: SOSAlert) => a.priority === 'high').length} High Priority Interrupts
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {openAlerts
                .filter((a: SOSAlert) => a.priority === 'critical' || a.priority === 'high')
                .slice(0, 3)
                .map((alert: SOSAlert) => (
                  <SOSAlertCard
                    key={alert.id}
                    alert={alert}
                    onRespond={() => handleViewAlert(alert)}
                    compact
                  />
                ))}
            </div>
          </div>
        </motion.div>
      )}

      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8" variants={itemVariants}>
        <div className="bg-vibrant-green text-white p-8 rounded-[2.5rem] shadow-xl shadow-vibrant-green/10 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors" />
          <Wrench className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Operational Fleet</p>
          <div className="flex items-baseline gap-3 relative z-10">
            <h4 className="text-5xl font-black tracking-tight">{operationalMachines}</h4>
            <span className="text-sm font-bold opacity-60 uppercase tracking-widest">/ {machines.length} Units</span>
          </div>
        </div>
        <div className={`p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 ${allActiveAlerts.length > 0 ? 'bg-chocolate-950 text-white shadow-chocolate-950/10' : 'bg-white border border-chocolate-100 text-chocolate-300'}`}>
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-vibrant-red/10 rounded-full blur-3xl" />
          <AlertTriangle className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-700" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Incident Vector</p>
          <h4 className="text-5xl font-black tracking-tight relative z-10">{allActiveAlerts.length}</h4>
          {openAlerts.filter(a => a.priority === 'critical').length > 0 && (
            <span className="inline-block mt-3 px-3 py-1 bg-vibrant-red text-white rounded-full text-[9px] font-black tracking-widest uppercase animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]">CRITICAL FAULT</span>
          )}
        </div>
        <div className="bg-gold-500 text-chocolate-950 p-8 rounded-[2.5rem] shadow-xl shadow-gold-500/10 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/20 rounded-full blur-3xl" />
          <Calendar className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10 group-hover:-rotate-12 transition-transform duration-700" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Preventative Queue</p>
          <h4 className="text-5xl font-black tracking-tight relative z-10">{maintenanceDueThisWeek}</h4>
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Next 168 Hours</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div className="lg:col-span-2 space-y-8" variants={itemVariants}>
          <Card className="rounded-[3rem] border-none bg-white p-1 shadow-xl shadow-chocolate-900/5 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-chocolate-50 p-10">
              <div>
                <CardTitle className="text-2xl font-black text-chocolate-950 flex items-center gap-4 uppercase tracking-tight">
                  <div className="p-3 bg-chocolate-100 rounded-2xl">
                    <Settings className="w-6 h-6 text-chocolate-600" />
                  </div>
                  Asset Health Matrix
                </CardTitle>
                <p className="text-[10px] font-black text-chocolate-400 tracking-[0.2em] uppercase mt-2">Fleet Diagnostic Overview</p>
              </div>
              <Button variant="ghost" className="text-[10px] font-black text-chocolate-400 hover:text-gold-600 transition-colors uppercase tracking-[0.2em] group" onClick={() => navigate('/mechanic/machines')}>
                FULL INVENTORY <ChevronRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardHeader>
            <CardContent className="p-10">
              {machinesLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
                  {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 bg-chocolate-50 rounded-2xl" />)}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {machines.slice(0, 6).map((machine: Machine) => (
                    <button
                      key={machine.id}
                      onClick={() => navigate(`/mechanic/machines/${machine.id}`)}
                      className={`p-6 rounded-[2.5rem] border border-chocolate-100/50 transition-all duration-500 hover:shadow-2xl hover:shadow-chocolate-200/40 hover:-translate-y-2 text-left relative overflow-hidden group bg-white`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-chocolate-50/30" />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                          <div className={`w-3.5 h-3.5 rounded-full ${getStatusColor(machine.status)} ${machine.status === 'repair' ? 'animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.8)]' : ''}`} />
                          <span className="text-[10px] font-black text-chocolate-300 font-mono tracking-widest uppercase">{machine.machine_code}</span>
                        </div>
                        <h4 className="font-black text-chocolate-950 text-base mb-1 truncate tracking-tight uppercase group-hover:text-gold-600 transition-colors">{machine.name}</h4>
                        <p className="text-[10px] text-chocolate-400 font-bold mb-6 uppercase tracking-widest">{machine.type}</p>
                        <div className="flex items-center justify-between mt-auto">
                           <div className={cn(
                             "text-[9px] font-black uppercase rounded-xl px-3 py-1 tracking-widest border shadow-sm",
                             machine.status === 'operational' ? 'bg-vibrant-green/10 text-vibrant-green border-vibrant-green/20' :
                             machine.status === 'maintenance' ? 'bg-vibrant-amber/10 text-vibrant-amber border-vibrant-amber/20' :
                             'bg-vibrant-red/10 text-vibrant-red border-vibrant-red/20'
                           )}>
                             {machine.status}
                           </div>
                           <Activity className="w-5 h-5 text-chocolate-100 group-hover:text-gold-500 group-hover:scale-110 transition-all duration-500" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none bg-white/70 backdrop-blur-md shadow-sm overflow-hidden p-6">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-chocolate-900 uppercase tracking-tighter flex items-center gap-2">
                  <Thermometer className="w-6 h-6 text-rose-500" /> System Telemetry
                </h3>
                <div className="flex gap-4 text-[10px] font-black uppercase">
                   <span className="flex items-center gap-1 text-chocolate-400"><div className="w-2 h-2 rounded-full bg-emerald-500" /> HEALTH</span>
                   <span className="flex items-center gap-1 text-chocolate-400"><div className="w-2 h-2 rounded-full bg-rose-500" /> TEMP</span>
                </div>
             </div>
             <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={HEALTH_DATA}>
                      <defs>
                        <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="health" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorHealth)" />
                      <Line type="monotone" dataKey="temp" stroke="#f43f5e" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </Card>
        </motion.div>

        <motion.div className="space-y-8" variants={itemVariants}>
          <Card className="rounded-3xl border-none bg-chocolate-900 text-white shadow-xl overflow-hidden relative min-h-[400px]">
            <img src="/assets/edit 6.png" className="absolute inset-0 w-full h-full object-cover opacity-20" alt="Repair" />
            <CardHeader className="relative z-10 p-6 border-b border-white/10">
              <CardTitle className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter">
                <ShieldAlert className="w-6 h-6 text-amber-400" />
                Active Incident Log
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 p-6">
              {alertsLoading ? (
                <div className="space-y-4 animate-pulse">
                   {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-2xl" />)}
                </div>
              ) : allActiveAlerts.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center">
                   <Zap className="w-12 h-12 text-amber-400 mb-4 opacity-20" />
                   <p className="text-sm font-black text-white/40 uppercase tracking-widest">Zero Active Incidents</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {allActiveAlerts.map((alert: SOSAlert) => (
                    <SOSAlertCard
                      key={alert.id}
                      alert={alert}
                      onRespond={() => handleViewAlert(alert)}
                      compact
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none bg-white/70 backdrop-blur-md shadow-sm overflow-hidden p-6">
               <div className="flex items-center justify-between mb-6">
                 <h3 className="text-lg font-black text-chocolate-900 flex items-center gap-3 uppercase tracking-tight">
                   <History className="w-6 h-6 text-chocolate-400" />
                   Recent Clearances
                 </h3>
                 <Button 
                   variant="ghost" 
                   size="sm" 
                   className="text-[10px] font-black text-chocolate-400 hover:text-chocolate-950 px-0 h-auto gap-1 uppercase tracking-widest group"
                   onClick={() => navigate('/mechanic/history')}
                 >
                   ALL RECORDS <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                 </Button>
               </div>
             <div className="space-y-4">
                {logsLoading ? (
                  <div className="space-y-3 animate-pulse">
                     {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 bg-chocolate-50 rounded-xl" />)}
                  </div>
                ) : (
                  maintenanceLogs.slice(0, 4).map((log: MaintenanceLog) => (
                    <div key={log.id} className="p-4 bg-chocolate-50/50 rounded-2xl border border-chocolate-100 hover:bg-white transition-all group">
                       <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-chocolate-900 uppercase tracking-tighter truncate w-2/3">{log.machine_name}</span>
                          <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-chocolate-200 text-chocolate-700 uppercase">{log.maintenance_type}</span>
                       </div>
                       <p className="text-[10px] text-chocolate-400 font-medium line-clamp-1">{log.description}</p>
                    </div>
                  ))
                )}
             </div>
          </Card>
        </motion.div>
      </div>

      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-8 right-8 flex flex-col gap-4 z-50"
      >
        <Button
          variant="default"
          size="lg"
          className="rounded-full w-20 h-20 bg-chocolate-950 text-white shadow-2xl hover:bg-black hover:scale-110 transition-all duration-500 flex items-center justify-center group ring-8 ring-chocolate-950/10"
          onClick={() => setIsMaintenanceModalOpen(true)}
        >
          <div className="absolute inset-0 bg-gold-500/10 scale-0 group-hover:scale-100 transition-transform duration-700 rounded-full" />
          <Plus className="w-10 h-10 group-hover:rotate-180 transition-transform duration-700 relative z-10" />
        </Button>
      </motion.div>

      <MaintenanceLogModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
      />

      {selectedAlert && (
        <ResolveAlertModal
          isOpen={isResolveModalOpen}
          onClose={() => {
            setIsResolveModalOpen(false);
            setSelectedAlert(null);
          }}
          alert={selectedAlert}
          onResolved={handleAlertResolved}
        />
      )}
    </motion.div>
  );
};

export default MechanicDashboard;


