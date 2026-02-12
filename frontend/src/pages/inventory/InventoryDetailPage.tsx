import React from 'react';
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
  ResponsiveContainer
} from 'recharts';
import StatsCard from '../../components/dashboard/StatsCard';

const InventoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useInventoryItem, useInventoryMovements, useDeleteItem } = useInventory();
  
  const { data: itemData, isLoading: isItemLoading } = useInventoryItem(id ?? '');
  const { data: movementsData, isLoading: isMovementsLoading } = useInventoryMovements(id ?? '');
  const deleteMutation = useDeleteItem();

  // Handle case where ID might be undefined
  if (!id) return null;

  const item = itemData;
  const movements = movementsData ?? [];

  const handleEdit = () => {
    toast.info('Edit functionality coming soon.');
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
        <Loader2 className="h-8 w-8 animate-spin text-chocolate-600" />
        <span className="ml-2 text-chocolate-600 font-medium">Loading item details...</span>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-chocolate-900">Item Not Found</h2>
        <button 
          onClick={() => navigate('/inventory')}
          className="mt-4 text-chocolate-600 hover:text-chocolate-800 hover:underline flex items-center justify-center gap-1 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Inventory
        </button>
      </div>
    );
  }

  // Prepare chart data from movements
  const chartData = movements.map(m => ({
    date: new Date(m.created_at).toLocaleDateString(),
    quantity: m.quantity
  })).slice(0, 10).reverse();

  return (
    <div className="space-y-8 animate-fadeIn">
      <button 
        onClick={() => navigate('/inventory')}
        className="group flex items-center gap-2 text-sm font-bold text-chocolate-900/40 hover:text-chocolate-900 transition-colors uppercase tracking-widest"
      >
        <div className="p-1.5 rounded-full bg-white border border-chocolate-900/10 group-hover:border-chocolate-900/30 transition-colors">
            <ArrowLeft className="w-4 h-4" /> 
        </div>
        Back to Inventory
      </button>

      <PageHeader 
        title={item.name} 
        subtitle={`SKU: ${item.code} • Category: ${item.category}`}
        actions={
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { void handleDelete(); }}
              className="p-2 text-chocolate-900/40 hover:text-vibrant-red hover:bg-vibrant-red/10 rounded-xl border border-transparent hover:border-vibrant-red/20 transition-all" 
              title="Delete Item"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button 
              onClick={handleEdit}
              className="flex items-center gap-2 px-6 py-2.5 bg-white border border-chocolate-100 text-chocolate-900 font-bold rounded-xl hover:bg-chocolate-50 hover:border-chocolate-200 shadow-sm transition-all"
            >
              <Edit className="w-4 h-4" />
              Edit Item
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content Area - Left Column (2/3) */}
        <div className="space-y-8 md:col-span-2">
            
            {/* KPI Grid */}
            <div className="grid grid-cols-2 gap-4">
                <StatsCard
                    title="Current Stock"
                    value={`${item.quantity} ${item.unit}`}
                    icon={Package}
                    color="primary"
                    className="p-5 min-h-[140px]"
                />
                <StatsCard
                    title="Reorder Point"
                    value={`${item.reorder_level} ${item.unit}`}
                    icon={AlertTriangle}
                    color="accent"
                    className="p-5 min-h-[140px]"
                />
                 <StatsCard
                    title="Unit Cost"
                    value={`$${item.cost_per_unit ?? 0}`}
                    icon={ClipboardCheck}
                    color="secondary"
                    className="p-5 min-h-[140px]"
                />
                <StatsCard
                    title="Total Valuation"
                    value={`$${(item.quantity * (item.cost_per_unit ?? 0)).toFixed(2)}`}
                    icon={Factory}
                    color="green"
                    className="p-5 min-h-[140px]"
                />
            </div>

            {/* Premium Chart Section */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-chocolate-100/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-lg font-black text-chocolate-950">Stock Movement Analysis</h3>
                        <p className="text-xs font-bold text-chocolate-900/30 uppercase tracking-widest mt-1">Real-time inventory tracking</p>
                    </div>
                </div>

                <div className="h-[300px] w-full relative z-10">
                    {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorQuantity" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8c594a" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#8c594a" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#a0aec0', fontSize: 10, fontWeight: 700 }} 
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#a0aec0', fontSize: 10, fontWeight: 700 }} 
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                            cursor={{ stroke: '#cfad9f', strokeWidth: 2, strokeDasharray: '4 4' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="quantity" 
                            stroke="#8c594a" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorQuantity)" 
                        />
                        </AreaChart>
                    </ResponsiveContainer>
                    ) : (
                    <div className="h-full flex flex-col items-center justify-center text-chocolate-900/20">
                        <Package className="w-12 h-12 mb-4 opacity-50" />
                        <span className="font-bold text-xs uppercase tracking-widest">No movement data available</span>
                    </div>
                    )}
                </div>
            </div>
        </div>

        {/* Info & Location Card - Right Column (1/3) */}
        <div className="space-y-6">
            {/* Metadata Card */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-chocolate-100/50">
             <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-gold-400/10 rounded-xl text-gold-600">
                    <ClipboardCheck className="w-5 h-5" />
                 </div>
                 <h3 className="text-xs font-black text-chocolate-900 uppercase tracking-[0.2em]">Item Specifications</h3>
             </div>
             
             <ul className="space-y-0 divide-y divide-chocolate-50 text-sm">
               <li className="flex justify-between py-4 group">
                 <span className="text-chocolate-900/40 font-bold text-xs uppercase tracking-wide">Location</span>
                 <span className="font-bold text-chocolate-950 group-hover:text-gold-600 transition-colors">{item.location}</span>
               </li>
               <li className="flex justify-between py-4 group">
                 <span className="text-chocolate-900/40 font-bold text-xs uppercase tracking-wide">Supplier</span>
                 <span className="font-bold text-chocolate-950 group-hover:text-gold-600 transition-colors">{item.supplier_name ?? item.supplier_id ?? 'Internal Source'}</span>
               </li>
               <li className="flex justify-between py-4 group">
                 <span className="text-chocolate-900/40 font-bold text-xs uppercase tracking-wide">Expiry</span>
                 <span className="font-bold text-chocolate-950 group-hover:text-gold-600 transition-colors">{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A'}</span>
               </li>
               <li className="flex justify-between py-4 group">
                 <span className="text-chocolate-900/40 font-bold text-xs uppercase tracking-wide">Updated</span>
                 <span className="font-bold text-chocolate-950 group-hover:text-gold-600 transition-colors">{item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'N/A'}</span>
               </li>
             </ul>
          </div>
          
          {/* Recent Movements Log */}
          <div className="bg-chocolate-950 text-white p-6 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-[40px] pointer-events-none" />
            
            <h3 className="text-xs font-black text-white/50 uppercase tracking-[0.2em] mb-6 relative z-10">Live Movement Log</h3>
            <div className="space-y-4 relative z-10">
              {isMovementsLoading ? (
                 <Loader2 className="w-5 h-5 animate-spin mx-auto text-white/20" />
              ) : movements.length === 0 ? (
                <p className="text-[10px] text-center text-white/20 font-mono tracking-widest uppercase">No movement history</p>
              ) : (
                movements.slice(0, 5).map((move, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm group">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${move.movement_type === 'IN' ? 'bg-vibrant-green/10 text-vibrant-green' : 'bg-vibrant-red/10 text-vibrant-red'}`}>
                          {move.movement_type === 'IN' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <p className="font-black text-xs text-white uppercase tracking-wider">{move.movement_type}BOUND</p>
                        <p className="text-[10px] text-white/30 font-mono">{new Date(move.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`font-mono font-bold ${move.movement_type === 'IN' ? 'text-vibrant-green' : 'text-vibrant-red'}`}>
                      {move.movement_type === 'IN' ? '+' : '-'}{move.quantity}
                    </span>
                  </div>
                ))
              )}
            </div>
            
            <button className="w-full mt-6 py-3 rounded-xl bg-white/5 text-[10px] font-black tracking-[0.2em] text-white/40 hover:bg-white/10 hover:text-white transition-all uppercase">
                View Full Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDetailPage;
