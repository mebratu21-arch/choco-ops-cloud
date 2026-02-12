import { useEffect, useState, useRef } from 'react';
import { APIResponse } from '../../types';
import apiClient from '../../lib/api/axios';
import { 
  Users, 
  Activity, 
  DollarSign, 
  Database, 
  UserPlus,
  Factory,
  Package,
  ShieldAlert,
  Zap,
  History,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Eye,
  FileText,
  Bell,
  Server,
  Cpu,
  BarChart3
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import UserManagement from './UserManagement';
import StatsCard from '../../components/dashboard/StatsCard';
import { toast } from 'sonner';

interface SystemStats {
    users: { total: number; active: number; new_this_week: number };
    system: { health: string; uptime: string; version: string };
    revenue: { daily: number; monthly: number; growth: string };
    db: { status: string; latency: string };
}

// ── RICH SAMPLE DATA ──────────────────────────────────────────────────

const MOVEMENT_DATA = [
    { name: '06:00', value: 22, type: 'PROD' },
    { name: '07:00', value: 38, type: 'SALES' },
    { name: '08:00', value: 45, type: 'PROD' },
    { name: '09:00', value: 58, type: 'LOGISTICS' },
    { name: '10:00', value: 52, type: 'SALES' },
    { name: '11:00', value: 64, type: 'PROD' },
    { name: '12:00', value: 48, type: 'LOGISTICS' },
    { name: '13:00', value: 42, type: 'SALES' },
    { name: '14:00', value: 61, type: 'PROD' },
    { name: '15:00', value: 70, type: 'PROD' },
    { name: '16:00', value: 55, type: 'SALES' },
    { name: '17:00', value: 67, type: 'PROD' },
    { name: '18:00', value: 74, type: 'LOGISTICS' },
    { name: '19:00', value: 60, type: 'SALES' },
    { name: '20:00', value: 72, type: 'LOGISTICS' },
    { name: '21:00', value: 35, type: 'PROD' },
];

const REVENUE_TREND_DATA = [
    { month: 'Jul', revenue: 85200, expenses: 62100, profit: 23100 },
    { month: 'Aug', revenue: 92400, expenses: 65800, profit: 26600 },
    { month: 'Sep', revenue: 88900, expenses: 61200, profit: 27700 },
    { month: 'Oct', revenue: 101500, expenses: 68400, profit: 33100 },
    { month: 'Nov', revenue: 114200, expenses: 72100, profit: 42100 },
    { month: 'Dec', revenue: 124500, expenses: 78300, profit: 46200 },
    { month: 'Jan', revenue: 118700, expenses: 74500, profit: 44200 },
];

const ROLE_DISTRIBUTION = [
    { name: 'Operators', value: 52, fill: '#F4B400' },
    { name: 'Managers', value: 18, fill: '#3b82f6' },
    { name: 'Admins', value: 6, fill: '#ef4444' },
    { name: 'Mechanics', value: 24, fill: '#22c55e' },
    { name: 'QC Staff', value: 14, fill: '#a855f7' },
    { name: 'Warehouse', value: 10, fill: '#f97316' },
];

const SYSTEM_LOAD_DATA = [
    { time: '00:00', cpu: 12, memory: 45, network: 22 },
    { time: '04:00', cpu: 8, memory: 42, network: 15 },
    { time: '08:00', cpu: 45, memory: 58, network: 48 },
    { time: '12:00', cpu: 72, memory: 68, network: 65 },
    { time: '16:00', cpu: 65, memory: 64, network: 58 },
    { time: '20:00', cpu: 38, memory: 52, network: 32 },
    { time: '23:59', cpu: 18, memory: 46, network: 20 },
];

const AUDIT_LOG_ENTRIES = [
    { id: 1, action: 'User Login', user: 'admin@cocoaflow.com', timestamp: '10:54 AM', status: 'success', detail: 'IP: 192.168.1.45' },
    { id: 2, action: 'Batch #B-1042 Approved', user: 'manager@cocoaflow.com', timestamp: '10:48 AM', status: 'success', detail: 'Dark Truffle Line' },
    { id: 3, action: 'Role Change', user: 'admin@cocoaflow.com', timestamp: '10:32 AM', status: 'warning', detail: 'J.Smith → MANAGER' },
    { id: 4, action: 'QC Inspection Failed', user: 'qc@cocoaflow.com', timestamp: '10:15 AM', status: 'error', detail: 'Batch #B-1039 — Temp deviation' },
    { id: 5, action: 'Inventory Restock', user: 'warehouse@cocoaflow.com', timestamp: '09:58 AM', status: 'success', detail: 'Cocoa Butter +500kg' },
    { id: 6, action: 'System Backup', user: 'system', timestamp: '09:00 AM', status: 'success', detail: 'Auto-backup to S3' },
    { id: 7, action: 'Machine Alert Ack', user: 'mechanic@cocoaflow.com', timestamp: '08:42 AM', status: 'warning', detail: 'Tempering Unit Beta' },
    { id: 8, action: 'New User Provisioned', user: 'admin@cocoaflow.com', timestamp: '08:30 AM', status: 'success', detail: 'R.Johnson — OPERATOR' },
    { id: 9, action: 'Recipe Updated', user: 'manager@cocoaflow.com', timestamp: '08:15 AM', status: 'success', detail: 'Dark Chocolate 72%' },
    { id: 10, action: 'Password Reset', user: 'admin@cocoaflow.com', timestamp: '07:55 AM', status: 'warning', detail: 'User: T.Williams' },
];

const RECENT_ALERTS = [
    { id: 1, type: 'critical', message: 'Tempering Unit Alpha — SOS Override Active', time: '2m ago' },
    { id: 2, type: 'warning', message: 'Cocoa butter stock below 20% threshold', time: '15m ago' },
    { id: 3, type: 'info', message: 'Batch #B-1042 quality check passed', time: '28m ago' },
    { id: 4, type: 'warning', message: 'Network latency spike on Node-3', time: '45m ago' },
    { id: 5, type: 'info', message: 'Daily backup completed successfully', time: '1h ago' },
];

const AdminDashboardPage = () => {
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAuditTrail, setShowAuditTrail] = useState(false);
    const userMgmtRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsRes = await apiClient.get<APIResponse<SystemStats>>('/admin/stats');
                if (statsRes.data.success && statsRes.data.data) {
                     setStats(statsRes.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch admin data', error);
                setStats({
                    users: { total: 124, active: 89, new_this_week: 12 },
                    system: { health: 'OPTIMAL', uptime: '99.99%', version: 'v4.2.0-STABLE' },
                    revenue: { daily: 4200.50, monthly: 124500.00, growth: '+14.2%' },
                    db: { status: 'SYNCHRONIZED', latency: '12ms' }
                });
            } finally {
                setLoading(false);
            }
        };

        void fetchData();
    }, []);

    const handleAuditTrail = () => {
        setShowAuditTrail(!showAuditTrail);
        toast.success(showAuditTrail ? 'Audit trail collapsed' : 'Audit trail expanded');
    };

    const handleProvisionUser = () => {
        // Scroll down to User Management and trigger click
        if (userMgmtRef.current) {
            userMgmtRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        toast.info('Scrolled to User Management — click "Add User" to provision');
    };

    const handleGlobalAudit = () => {
        setShowAuditTrail(true);
        toast.success('Global System Audit initiated — all logs visible');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#FDFCF0]">
                <div className="animate-spin h-12 w-12 border-4 border-[#F4B400] border-t-transparent rounded-full" />
                <span className="ml-4 font-black text-[#1A0C06]/40 uppercase tracking-[0.3em] text-xs">Accessing Command Layer...</span>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20 animate-fade-in max-w-7xl mx-auto">
            {/* Header / Top Command Bar */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                   <div className="flex items-center gap-2 mb-2">
                        <ShieldAlert className="w-5 h-5 text-[#F4B400]" />
                        <span className="text-[10px] font-black text-[#1A0C06]/30 uppercase tracking-[0.4em]">Security Level 4 / Full Oversight</span>
                   </div>
                   <h1 className="text-4xl font-black text-[#1A0C06] tracking-tight leading-none">
                      System Command <span className="text-[#F4B400]">Center</span>
                   </h1>
                   <p className="text-xs text-[#1A0C06]/40 mt-2 font-medium">Real-time monitoring • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleAuditTrail}
                        className={`flex items-center gap-2 px-6 py-3 ${showAuditTrail ? 'bg-[#F4B400] text-[#1A0C06]' : 'bg-white text-[#1A0C06]'} border border-chocolate-100 font-bold rounded-2xl hover:bg-chocolate-50 shadow-sm transition-all text-sm uppercase tracking-widest`}
                    >
                        <History className="w-4 h-4" />
                        Audit Trail
                    </button>
                    <button 
                        onClick={handleProvisionUser}
                        className="flex items-center gap-2 px-8 py-3 bg-[#1A0C06] text-white font-bold rounded-2xl hover:bg-black shadow-xl shadow-chocolate-950/20 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm uppercase tracking-[0.2em]"
                    >
                        <UserPlus className="w-4 h-4 text-[#F4B400]" />
                        Provision User
                    </button>
                </div>
            </div>

            {/* Universal Pulse Tracker - Multi-actor KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard 
                    title="Revenue Velocity" 
                    value={`$${stats?.revenue.monthly.toLocaleString()}`} 
                    icon={DollarSign}
                    color="primary"
                    trend={{ value: 14.2, label: 'MoM', positive: true }}
                    description="Aggregate Financial Oversight"
                />
                <StatsCard 
                    title="Operational Uptime" 
                    value={stats?.system.uptime ?? '99.9%'} 
                    icon={Zap}
                    color="green"
                    trend={{ value: 0.01, label: 'LIFETIME', positive: true }}
                    description="Global Asset Stability"
                />
                <StatsCard 
                    title="Factory Workforce" 
                    value={stats?.users.total.toString() ?? '0'} 
                    icon={Users}
                    color="secondary"
                    trend={{ value: stats?.users.new_this_week ?? 0, label: 'NEW', positive: true }}
                    description="Active Personnel Managed"
                />
                <StatsCard 
                    title="Network Latency" 
                    value={stats?.db.latency ?? '12ms'} 
                    icon={Activity}
                    color="accent"
                    description="Real-time Core Response"
                />
            </div>

            {/* ── AUDIT TRAIL SECTION (Toggleable) ────────────────────────── */}
            {showAuditTrail && (
                <div className="bg-white rounded-[2rem] shadow-xl shadow-chocolate-950/5 border border-chocolate-100/50 overflow-hidden animate-fade-in">
                    <div className="px-10 py-8 border-b border-chocolate-100/50 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-[#1A0C06] uppercase tracking-tight flex items-center gap-3">
                                <FileText className="w-5 h-5 text-[#F4B400]" />
                                System Audit Trail
                            </h3>
                            <p className="text-[10px] font-bold text-[#1A0C06]/30 uppercase tracking-[0.2em] mt-1">Live event stream • Last 24 hours</p>
                        </div>
                        <button 
                            onClick={() => setShowAuditTrail(false)}
                            className="text-[#1A0C06]/40 hover:text-[#1A0C06] text-xs font-black uppercase tracking-widest"
                        >
                            Collapse
                        </button>
                    </div>
                    <div className="divide-y divide-chocolate-50">
                        {AUDIT_LOG_ENTRIES.map((entry) => (
                            <div key={entry.id} className="px-10 py-4 flex items-center gap-6 hover:bg-chocolate-50/30 transition-colors group">
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                    entry.status === 'success' ? 'bg-green-500' :
                                    entry.status === 'warning' ? 'bg-yellow-500' :
                                    'bg-red-500'
                                }`} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-[#1A0C06]">{entry.action}</span>
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                            entry.status === 'success' ? 'bg-green-50 text-green-700' :
                                            entry.status === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                                            'bg-red-50 text-red-700'
                                        }`}>{entry.status}</span>
                                    </div>
                                    <p className="text-xs text-[#1A0C06]/40 mt-0.5">{entry.detail}</p>
                                </div>
                                <span className="text-[10px] font-bold text-[#1A0C06]/30 whitespace-nowrap">{entry.user}</span>
                                <span className="text-[10px] font-bold text-[#1A0C06]/20 whitespace-nowrap flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {entry.timestamp}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Universal Oversight Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                {/* Global Performance Telemetry */}
                <div className="md:col-span-8 space-y-10">
                    {/* Cross-Functional Telemetry Bar Chart */}
                    <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-chocolate-950/5 border border-chocolate-100/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h3 className="text-xl font-black text-[#1A0C06] uppercase tracking-tight">Cross-Functional Telemetry</h3>
                                <p className="text-[10px] font-bold text-[#1A0C06]/30 uppercase tracking-[0.2em] mt-1">Unified monitoring • 16-hour window • All actor segments</p>
                            </div>
                            <div className="flex items-center gap-4">
                               <div className="flex items-center gap-1.5 text-[9px] font-black text-[#1A0C06]/40">
                                  <div className="w-2 h-2 rounded-full bg-[#1A0C06]" /> PROD
                               </div>
                               <div className="flex items-center gap-1.5 text-[9px] font-black text-[#1A0C06]/40">
                                  <div className="w-2 h-2 rounded-full bg-[#F4B400]" /> SALES
                               </div>
                               <div className="flex items-center gap-1.5 text-[9px] font-black text-[#1A0C06]/40">
                                  <div className="w-2 h-2 rounded-full bg-blue-500" /> LOGISTICS
                               </div>
                            </div>
                        </div>

                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={MOVEMENT_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 9, fontWeight: 900, fill: '#8c594a' }}
                                        dy={15}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 10, fontWeight: 900, fill: '#8c594a' }}
                                    />
                                    <Tooltip 
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ backgroundColor: '#1A0C06', borderRadius: '24px', border: 'none', color: '#fff', padding: '16px' }}
                                    />
                                    <Bar dataKey="value" barSize={28} radius={[10, 10, 10, 10]}>
                                        {MOVEMENT_DATA.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={entry.type === 'PROD' ? '#1A0C06' : entry.type === 'SALES' ? '#F4B400' : '#3b82f6'} 
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Revenue & Expense Trends - NEW CHART */}
                    <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-chocolate-950/5 border border-chocolate-100/50 relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-[#1A0C06] uppercase tracking-tight flex items-center gap-3">
                                    <TrendingUp className="w-5 h-5 text-green-500" />
                                    Revenue & Expense Trends
                                </h3>
                                <p className="text-[10px] font-bold text-[#1A0C06]/30 uppercase tracking-[0.2em] mt-1">7-Month financial overview • Knex.js aggregation pipeline</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-[#1A0C06]/30 uppercase tracking-widest">Total Revenue</p>
                                    <p className="text-lg font-black text-[#1A0C06]">$725.4k</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-[#1A0C06]/30 uppercase tracking-widest">Net Profit</p>
                                    <p className="text-lg font-black text-green-600 flex items-center gap-1">
                                        <ArrowUpRight className="w-4 h-4" />$243k
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={REVENUE_TREND_DATA}>
                                    <defs>
                                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#F4B400" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#F4B400" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 800, fill: '#8c594a' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#8c594a' }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1A0C06', borderRadius: '20px', border: 'none', color: '#fff', padding: '16px' }}
                                        formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 900 }} />
                                    <Area type="monotone" dataKey="revenue" stroke="#F4B400" strokeWidth={3} fill="url(#revenueGrad)" name="Revenue" />
                                    <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGrad)" name="Expenses" strokeDasharray="5 5" />
                                    <Area type="monotone" dataKey="profit" stroke="#22c55e" strokeWidth={2.5} fill="url(#profitGrad)" name="Profit" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Role Distribution & System Load - Side by Side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Workforce Role Distribution - NEW PIE CHART */}
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-chocolate-950/5 border border-chocolate-100/50">
                            <h3 className="text-sm font-black text-[#1A0C06] uppercase tracking-tight flex items-center gap-2 mb-1">
                                <Users className="w-4 h-4 text-[#F4B400]" />
                                Workforce Distribution
                            </h3>
                            <p className="text-[9px] font-bold text-[#1A0C06]/30 uppercase tracking-[0.15em] mb-6">By role assignment • {ROLE_DISTRIBUTION.reduce((a, b) => a + b.value, 0)} total</p>

                            <div className="h-[260px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={ROLE_DISTRIBUTION}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={90}
                                            paddingAngle={3}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            labelLine={false}
                                            style={{ fontSize: '9px', fontWeight: 800 }}
                                        >
                                            {ROLE_DISTRIBUTION.map((entry, index) => (
                                                <Cell key={`cell-role-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#1A0C06', borderRadius: '16px', border: 'none', color: '#fff', padding: '12px' }}
                                            formatter={(value: number) => [`${value} users`, '']}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* System Load Over Time - NEW LINE CHART */}
                        <div className="bg-[#1A0C06] p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-gold-400/10 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/4" />

                            <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2 mb-1 relative z-10">
                                <Server className="w-4 h-4 text-[#F4B400]" />
                                System Load Monitor
                            </h3>
                            <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.15em] mb-6 relative z-10">24-hour infrastructure metrics</p>

                            <div className="h-[260px] w-full relative z-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={SYSTEM_LOAD_DATA}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800, fill: 'rgba(255,255,255,0.3)' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800, fill: 'rgba(255,255,255,0.3)' }} tickFormatter={(v) => `${v}%`} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', color: '#1A0C06', padding: '12px' }}
                                        />
                                        <Line type="monotone" dataKey="cpu" stroke="#F4B400" strokeWidth={2.5} dot={{ r: 3, fill: '#F4B400' }} name="CPU" />
                                        <Line type="monotone" dataKey="memory" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} name="Memory" />
                                        <Line type="monotone" dataKey="network" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: '#22c55e' }} name="Network" />
                                        <Legend wrapperStyle={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.5)' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Full User Control Module */}
                    <div ref={userMgmtRef}>
                        <UserManagement />
                    </div>
                </div>

                {/* System Governance Sidebar */}
                <div className="md:col-span-4 space-y-8">
                    {/* Database Health Card */}
                    <div className="bg-[#1A0C06] text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-gold-400/20 transition-all duration-700" />
                        <Database className="w-10 h-10 text-[#F4B400] mb-8" />
                        
                        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">Instance Health</h3>
                        <div className="flex items-baseline gap-2 mb-8">
                            <span className="text-4xl font-black text-white">{stats?.db.status === 'SYNCHRONIZED' ? '99.9' : '98.5'}</span>
                            <span className="text-sm font-black text-gold-500 uppercase">% SYNC</span>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/30">
                                <span>DB Engine</span>
                                <span className="text-white">PostgreSQL 15</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/30">
                                <span>Core Load</span>
                                <span className="text-vibrant-green">NOMINAL</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/30">
                                <span>Query Avg</span>
                                <span className="text-white">4.2ms</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/30">
                                <span>Connections</span>
                                <span className="text-white">18 / 100</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/30">
                                <span>Storage</span>
                                <span className="text-[#F4B400]">2.4 GB / 10 GB</span>
                            </div>
                        </div>
                    </div>

                    {/* System Alerts Feed - NEW */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-chocolate-950/5 border border-chocolate-100/50">
                        <h4 className="flex items-center gap-2 text-[11px] font-black text-[#1A0C06] uppercase tracking-[0.2em] mb-6">
                            <Bell className="w-4 h-4 text-red-500" /> Live Alerts
                        </h4>
                        <div className="space-y-3">
                            {RECENT_ALERTS.map((alert) => (
                                <div 
                                    key={alert.id} 
                                    className="flex items-start gap-3 p-3 rounded-2xl bg-chocolate-50/30 hover:bg-chocolate-50/60 transition-colors cursor-pointer group"
                                    onClick={() => toast.info(`Viewing details for: ${alert.message}`)}
                                >
                                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                        alert.type === 'critical' ? 'bg-red-500 animate-pulse' :
                                        alert.type === 'warning' ? 'bg-yellow-500' :
                                        'bg-blue-400'
                                    }`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-[#1A0C06] leading-tight">{alert.message}</p>
                                        <p className="text-[9px] font-bold text-[#1A0C06]/30 mt-1">{alert.time}</p>
                                    </div>
                                    <Eye className="w-3.5 h-3.5 text-[#1A0C06]/20 group-hover:text-[#F4B400] transition-colors flex-shrink-0 mt-0.5" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Multi-Actor Quick Insights */}
                    <div className="bg-white/40 backdrop-blur-md p-8 rounded-[3rem] border border-white/60 space-y-6">
                        <div>
                             <h4 className="flex items-center gap-2 text-[11px] font-black text-[#1A0C06] uppercase tracking-[0.2em] mb-4">
                                <Factory className="w-4 h-4 text-[#F4B400]" /> Production Floor
                             </h4>
                             <div className="space-y-2">
                                 <div className="flex items-center justify-between p-4 rounded-2xl bg-white shadow-sm border border-chocolate-50">
                                    <span className="text-xs font-bold text-[#1A0C06]/60">Active Batches</span>
                                    <span className="text-sm font-black text-[#1A0C06]">12</span>
                                 </div>
                                 <div className="flex items-center justify-between p-4 rounded-2xl bg-white shadow-sm border border-chocolate-50">
                                    <span className="text-xs font-bold text-[#1A0C06]/60">Yield Rate</span>
                                    <span className="text-sm font-black text-green-600 flex items-center gap-1">
                                        <ArrowUpRight className="w-3 h-3" />96.4%
                                    </span>
                                 </div>
                             </div>
                        </div>

                        <div>
                             <h4 className="flex items-center gap-2 text-[11px] font-black text-[#1A0C06] uppercase tracking-[0.2em] mb-4">
                                <Package className="w-4 h-4 text-blue-500" /> Logistics Core
                             </h4>
                             <div className="space-y-2">
                                 <div className="flex items-center justify-between p-4 rounded-2xl bg-white shadow-sm border border-chocolate-50">
                                    <span className="text-xs font-bold text-[#1A0C06]/60">Stock Valuation</span>
                                    <span className="text-sm font-black text-[#1A0C06]">$42.4k</span>
                                 </div>
                                 <div className="flex items-center justify-between p-4 rounded-2xl bg-white shadow-sm border border-chocolate-50">
                                    <span className="text-xs font-bold text-[#1A0C06]/60">Pending Shipments</span>
                                    <span className="text-sm font-black text-[#F4B400]">7</span>
                                 </div>
                             </div>
                        </div>

                        <div>
                             <h4 className="flex items-center gap-2 text-[11px] font-black text-[#1A0C06] uppercase tracking-[0.2em] mb-4">
                                <BarChart3 className="w-4 h-4 text-purple-500" /> Quality Control
                             </h4>
                             <div className="space-y-2">
                                 <div className="flex items-center justify-between p-4 rounded-2xl bg-white shadow-sm border border-chocolate-50">
                                    <span className="text-xs font-bold text-[#1A0C06]/60">Pass Rate</span>
                                    <span className="text-sm font-black text-green-600">98.2%</span>
                                 </div>
                                 <div className="flex items-center justify-between p-4 rounded-2xl bg-white shadow-sm border border-chocolate-50">
                                    <span className="text-xs font-bold text-[#1A0C06]/60">Open Defects</span>
                                    <span className="text-sm font-black text-red-500">3</span>
                                 </div>
                             </div>
                        </div>

                        <button 
                            onClick={handleGlobalAudit}
                            className="w-full py-4 bg-[#1A0C06] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-black transition-all shadow-lg shadow-chocolate-950/20 active:scale-95"
                        >
                           Global System Audit
                        </button>
                    </div>

                    {/* System Version Card - NEW */}
                    <div className="bg-gradient-to-br from-[#F4B400]/10 to-[#F4B400]/5 p-6 rounded-[2rem] border border-[#F4B400]/20">
                        <div className="flex items-center gap-3 mb-4">
                            <Cpu className="w-5 h-5 text-[#F4B400]" />
                            <span className="text-[10px] font-black text-[#1A0C06]/50 uppercase tracking-[0.2em]">Platform Info</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-[#1A0C06]/50">Version</span>
                                <span className="text-xs font-black text-[#1A0C06]">{stats?.system.version ?? 'v4.2.0'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-[#1A0C06]/50">Runtime</span>
                                <span className="text-xs font-black text-[#1A0C06]">Node.js 20 LTS</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-[#1A0C06]/50">Framework</span>
                                <span className="text-xs font-black text-[#1A0C06]">React 18 + Vite</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-[#1A0C06]/50">ORM</span>
                                <span className="text-xs font-black text-[#1A0C06]">Knex.js</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-[#1A0C06]/50">Status</span>
                                <span className="text-[10px] font-black text-green-700 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> ALL SYSTEMS GO
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
