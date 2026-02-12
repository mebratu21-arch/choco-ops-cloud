import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInventory } from '../../hooks/useInventory';
import PageHeader from '../../components/layout/PageHeader';
import { Loader2, Package, ArrowLeft, Edit, Trash2, ArrowUp, ArrowDown, AlertTriangle, ClipboardCheck, Factory } from 'lucide-react';
import { toast } from 'sonner';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import StatsCard from '../../components/dashboard/StatsCard';
import AddItemModal from '../../components/inventory/AddItemModal';
import MovementLogModal from '../../components/inventory/MovementLogModal';

const InventoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useInventoryItem, useInventoryMovements, useDeleteItem } = useInventory();
  
  const { data: itemData, isLoading: isItemLoading } = useInventoryItem(id ?? '');
  const { data: movementsData, isLoading: isMovementsLoading } = useInventoryMovements(id ?? '');
  const deleteMutation = useDeleteItem();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Handle case where ID might be undefined
  if (!id) return null;

  const item = itemData;
  const movements = movementsData ?? [];

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Item deleted successfully');
        navigate('/inventory');
      } catch {
        toast.error('Failed to delete item');
      }
    }
  };

  if (isItemLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="relative">
            <div className="absolute inset-0 blur-xl bg-chocolate-400/20 rounded-full animate-pulse" />
            <Loader2 className="h-10 w-10 animate-spin text-chocolate-600 relative z-10" />
        </div>
        <span className="ml-4 text-chocolate-900 font-black tracking-widest uppercase text-xs">Synchronizing Archive...</span>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-24">
        <h2 className="text-4xl font-black text-chocolate-950 mb-4 tracking-tighter">Access Denied</h2>
        <p className="text-chocolate-900/40 font-bold mb-8">The requested asset could not be located in the vault.</p>
        <button 
          onClick={() => navigate('/inventory')}
          className="mx-auto flex items-center gap-3 px-8 py-4 bg-chocolate-950 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Vault Surface
        </button>
      </div>
    );
  }

  // Prepare aggregated chart data (one point per day, last recorded quantity)
  interface ChartDataPoint {
    date: string;
    quantity: number;
  }

  const aggregatedData = movements.reduce((acc: ChartDataPoint[], m) => {
    const dateStr = new Date(m.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const existing = acc.find(d => d.date === dateStr);
    if (existing) {
        // Keep the most recent record for that day
        existing.quantity = m.quantity;
    } else {
        acc.push({ date: dateStr, quantity: Number(m.quantity) });
    }
    return acc;
  }, []).slice(0, 15).reverse();

  // Fallback: If no movements, show current quantity as a single point
  if (aggregatedData.length === 0 && item) {
    aggregatedData.push({
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      quantity: Number(item.quantity)
    });
  }

  const chartData = aggregatedData;

  // Custom Tooltip for the chart
  interface TooltipPayload {
    value: number | string;
    payload: Record<string, unknown>;
  }

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-chocolate-100/50">
          <p className="text-[10px] font-black text-chocolate-900/30 uppercase tracking-[0.2em] mb-1">{label}</p>
          <p className="text-xl font-black text-chocolate-950">
            {payload[0].value} <span className="text-xs text-chocolate-900/60 uppercase">{item.unit}</span>
          </p>
          <div className="mt-2 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-chocolate-500" />
              <span className="text-[10px] font-bold text-chocolate-900/60">Inventory Snapshot</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-[1400px] mx-auto">
      <button 
        onClick={() => navigate('/inventory')}
        className="group flex items-center gap-4 text-[10px] font-black text-chocolate-900/40 hover:text-chocolate-900 transition-all uppercase tracking-[0.3em]"
      >
        <div className="p-2.5 rounded-2xl bg-white border border-chocolate-900/5 group-hover:border-chocolate-900/20 group-hover:scale-110 shadow-sm transition-all">
            <ArrowLeft className="w-4 h-4" /> 
        </div>
        Back to Archive
      </button>

      <PageHeader 
        title={item.name} 
        subtitle={`SEC_ID: ${item.code} • CLASS: ${item.category.toUpperCase()}`}
        actions={
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { void handleDelete(); }}
              className="p-3 text-chocolate-900/30 hover:text-vibrant-red hover:bg-vibrant-red/5 rounded-2xl border border-transparent hover:border-vibrant-red/10 transition-all group" 
              title="Decommission Asset"
            >
              <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
            <button 
              onClick={handleEdit}
              className="flex items-center gap-3 px-8 py-3.5 bg-white border border-chocolate-100 text-chocolate-950 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-chocolate-50 hover:border-chocolate-200 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)] hover:shadow-chocolate-200/20 transition-all active:scale-95"
            >
              <Edit className="w-4 h-4" />
              Edit Specification
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content Area - Left Column (8/12) */}
        <div className="space-y-8 lg:col-span-8">
            
            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatsCard
                    title="Current Reserve"
                    value={`${item.quantity} ${item.unit}`}
                    icon={Package}
                    color="primary"
                    className="p-6 relative overflow-hidden group"
                />
                <StatsCard
                    title="Critical Buffer"
                    value={`${item.reorder_level} ${item.unit}`}
                    icon={AlertTriangle}
                    color="accent"
                    className="p-6"
                />
                 <StatsCard
                    title="Unit Valuation"
                    value={`$${Number(item.cost_per_unit ?? 0).toFixed(2)}`}
                    icon={ClipboardCheck}
                    color="secondary"
                    className="p-6"
                />
                <StatsCard
                    title="Total Asset Value"
                    value={`$${(item.quantity * (item.cost_per_unit ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={Factory}
                    color="green"
                    className="p-6"
                />
            </div>

            {/* Premium Chart Section */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] border border-chocolate-100/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gold-400/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
                
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                            <h3 className="text-2xl font-black text-chocolate-950 tracking-tighter">Inventory Trajectory</h3>
                        </div>
                        <p className="text-[11px] font-bold text-chocolate-900/40 uppercase tracking-[0.4em] mt-1">Global Asset Movement Intelligence</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="px-4 py-2 bg-chocolate-950 text-white rounded-[1.2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-chocolate-900/20">
                            Last 30 Cycles
                        </div>
                    </div>
                </div>

                <div className="h-[450px] w-full relative z-10 transition-all duration-700 group-hover:scale-[1.01]">
                    {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 60, right: 30, left: 10, bottom: 30 }}>
                        <defs>
                            <linearGradient id="colorQuantity" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5}/>
                                <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                            </linearGradient>
                            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="3" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>
                        <CartesianGrid strokeDasharray="12 12" stroke="rgba(140,89,74,0.1)" vertical={false} />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#8c594a', fontSize: 10, fontStyle: 'italic', fontWeight: 900, letterSpacing: '0.05em' }} 
                            dy={20}
                            minTickGap={30}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#8c594a', fontSize: 10, fontWeight: 900 }} 
                            domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.3)]}
                            padding={{ top: 20 }}
                        />
                        <Tooltip 
                            content={<CustomTooltip />}
                            cursor={{ stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '6 6' }}
                        />
                        <ReferenceLine 
                            y={item.reorder_level} 
                            stroke="#ef4444" 
                            strokeDasharray="8 8" 
                            strokeWidth={1.5}
                            opacity={0.4}
                            label={{ 
                                value: 'BUFFER_LIMIT', 
                                position: 'insideTopRight', 
                                fill: '#ef4444', 
                                fontSize: 9, 
                                fontWeight: 900,
                                dy: -15,
                                dx: -10
                            }} 
                        />
                        <Area 
                            type="monotone" 
                            dataKey="quantity" 
                            stroke="#f59e0b" 
                            strokeWidth={4} 
                            fillOpacity={1} 
                            fill="url(#colorQuantity)" 
                            animationDuration={2000}
                            filter="url(#goldGlow)"
                            activeDot={{ r: 10, fill: '#f59e0b', stroke: '#fff', strokeWidth: 4, shadow: '0 0 20px rgba(245,158,11,0.8)' }}
                        />
                        </AreaChart>
                    </ResponsiveContainer>
                    ) : (
                    <div className="h-full flex flex-col items-center justify-center text-chocolate-900/20 bg-chocolate-50/30 rounded-3xl border-2 border-dashed border-chocolate-100">
                        <Package className="w-16 h-16 mb-4 opacity-10" />
                        <span className="font-black text-[10px] uppercase tracking-[0.5em]">Insufficient Data for Mapping</span>
                    </div>
                    )}
                </div>
            </div>
        </div>

        {/* Info & Location Card - Right Column (4/12) */}
        <div className="space-y-6 lg:col-span-4">
            {/* Metadata Card */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-chocolate-100/50">
             <div className="flex items-center gap-4 mb-8">
                 <div className="p-3 bg-gold-400/10 rounded-2xl text-gold-600">
                    <ClipboardCheck className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="text-[10px] font-black text-chocolate-900 uppercase tracking-[0.2em] mb-0.5">Asset Specifications</h3>
                    <p className="text-[9px] font-bold text-chocolate-900/30 uppercase">Vault Registry v4.1</p>
                 </div>
             </div>
             
             <ul className="space-y-0 divide-y divide-chocolate-50 text-sm">
               <li className="flex justify-between py-5 group">
                 <span className="text-chocolate-900/40 font-black text-[10px] uppercase tracking-widest">Silo Location</span>
                 <span className="font-black text-chocolate-950 group-hover:text-gold-600 transition-colors uppercase tracking-tight">{item.location}</span>
               </li>
               <li className="flex justify-between py-5 group">
                 <span className="text-chocolate-900/40 font-black text-[10px] uppercase tracking-widest">Master Supplier</span>
                 <span className="font-black text-chocolate-950 group-hover:text-gold-600 transition-colors uppercase tracking-tight">{item.supplier_name ?? item.supplier_id ?? 'INT_SOURCE'}</span>
               </li>
               <li className="flex justify-between py-5 group">
                 <span className="text-chocolate-900/40 font-black text-[10px] uppercase tracking-widest">Life Cycle End</span>
                 <span className="font-black text-chocolate-950 group-hover:text-gold-600 transition-colors font-mono">{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'PERPETUAL'}</span>
               </li>
               <li className="flex justify-between py-5 group">
                 <span className="text-chocolate-900/40 font-black text-[10px] uppercase tracking-widest">Last Sync</span>
                 <span className="font-black text-chocolate-950 group-hover:text-gold-600 transition-colors font-mono">{item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'N/A'}</span>
               </li>
             </ul>
          </div>
          
          {/* Recent Movements Log */}
          <div className="bg-chocolate-950 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/10 rounded-full blur-[60px] pointer-events-none -translate-y-1/2 translate-x-1/2 group-hover:bg-gold-500/20 transition-all duration-1000" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Vault Activity Feed</h3>
                <div className="w-2 h-2 rounded-full bg-vibrant-green animate-pulse" />
            </div>

            <div className="space-y-5 relative z-10">
              {isMovementsLoading ? (
                 <div className="flex justify-center py-6">
                    <Loader2 className="w-6 h-6 animate-spin text-white/20" />
                 </div>
              ) : movements.length === 0 ? (
                <p className="text-[9px] text-center text-white/20 font-mono tracking-widest uppercase py-8 border border-white/5 rounded-3xl">Zero Activity Detected</p>
              ) : (
                movements.slice(0, 5).map((move, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm group/item">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl transition-all group-hover/item:scale-110 ${move.movement_type?.toLowerCase() === 'in' ? 'bg-vibrant-green/10 text-vibrant-green' : 'bg-vibrant-red/10 text-vibrant-red'}`}>
                          {move.movement_type?.toLowerCase() === 'in' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-black text-[10px] text-white uppercase tracking-[0.15em]">{move.movement_type}BOUND</p>
                        <p className="text-[9px] text-white/30 font-mono mt-0.5">{new Date(move.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`font-mono text-sm font-black ${move.movement_type?.toLowerCase() === 'in' ? 'text-vibrant-green' : 'text-vibrant-red'}`}>
                      {move.movement_type?.toLowerCase() === 'in' ? '+' : '-'}{move.quantity}
                    </span>
                  </div>
                ))
              )}
            </div>
            
            <button 
                onClick={() => setIsLogModalOpen(true)}
                className="w-full mt-10 py-5 rounded-2xl bg-white/5 text-[10px] font-black tracking-[0.3em] text-white/60 hover:bg-white/10 hover:text-white transition-all uppercase border border-white/5"
            >
                Access Deep Audit Log
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddItemModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        editItem={item}
      />

      <MovementLogModal 
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        movements={movements}
        itemName={item.name}
      />
    </div>
  );
};

export default InventoryDetailPage;
