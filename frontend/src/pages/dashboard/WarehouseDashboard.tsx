import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { 
  Package, 
  Thermometer, 
  Truck, 
  Boxes, 
  Search, 
  AlertTriangle, 
  ChevronDown, 
  ShieldCheck, 
  Map as MapIcon,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { inventoryService } from '../../services/inventoryService';
import { InventoryItem } from '../../types';
import { Button } from '../../components/ui/Button';

// Industrial Theme Color Palette
// (Colors are managed via industrial-* tailwind tokens)

const WarehouseDashboard: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await inventoryService.getAllItems({ limit: 1000 });
        // Ensure result.items is treated as a typed array
        setItems((result.items || []));
      } catch (err) {
        console.error('Failed to load inventory:', err);
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, []);

  // Mock data for new modules
  const envStats = { temp: '18.4°C', humidity: '45%', status: 'Optimal' };
  const mockBatches = [
    { id: 'BAT-2024-001', date: '2024-02-10', ingredients: 'Cocoa Butter, Sugar, Lecithin', quality: '98.5%', status: 'Curing' },
    { id: 'BAT-2024-002', date: '2024-02-09', ingredients: '70% Cocoa Mass, Bourbon Vanilla', quality: '99.2%', status: 'Tempering' },
  ];
  const mockShipments = {
    incoming: [
      { id: 'PO-9912', supplier: 'Equator Cocoa', eta: '2H', status: 'En Route' },
      { id: 'PO-9915', supplier: 'Madagascar Beans', eta: 'Tomorrow', status: 'Processing' },
    ],
    outgoing: [
      { id: 'ORD-772', customer: 'Artisan Choco', etd: '1H', status: 'Loading' },
      { id: 'ORD-775', customer: 'Global Sweets', etd: '5H', status: 'Pending' },
    ],
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-industrial-background">
      <RefreshCw className="w-8 h-8 text-industrial-secondary animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent p-6 space-y-8 animate-fadeIn">
      
      {/* PREMIUM HUB HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-chocolate-950 via-chocolate-900 to-[#2A150D] p-10 text-white shadow-2xl shadow-chocolate-950/40 flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-chocolate-800/20 rounded-full blur-[80px] -translate-x-1/4 translate-y-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-xl">
              <Package className="w-6 h-6 text-amber-500" />
            </div>
            <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 font-black px-4 py-1 rounded-xl text-[10px] tracking-[0.2em] uppercase">Logistics Command</Badge>
          </div>
          <h1 className="text-5xl font-black tracking-tighter leading-none mb-2 uppercase">
            Central <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200">Warehouse</span>
          </h1>
          <p className="text-chocolate-200/60 font-bold max-w-md text-sm leading-relaxed tracking-wide">
            Industrial logistics and asset orchestration platform. Monitoring real-time inventory flow and environmental stability.
          </p>
        </div>
        
        <div className="relative z-10 flex flex-wrap items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-chocolate-400 group-focus-within:text-amber-500 transition-colors" />
            <input 
              type="text" 
              placeholder="GLOBAL TRACKING..." 
              onKeyDown={(e) => e.key === 'Enter' && toast.info(`Accessing Manifest: ${e.currentTarget.value}`)}
              className="bg-white/5 border-2 border-white/5 backdrop-blur-xl pl-12 pr-6 py-4 rounded-2xl w-64 focus:outline-none focus:border-amber-500/50 transition-all text-xs font-black uppercase tracking-widest text-white placeholder:text-chocolate-400/50"
            />
          </div>
          <button 
            onClick={() => toast.warning("System Alert Protocol Initialized")}
            className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-amber-600 to-amber-500 rounded-2xl hover:scale-105 transition-all shadow-xl shadow-amber-900/20"
          >
            <AlertTriangle className="w-4 h-4 text-chocolate-950 fill-chocolate-950/20" />
            <span className="text-[10px] font-black text-chocolate-950 uppercase tracking-widest">4 ACTIVE ALERTS</span>
          </button>
        </div>
      </motion.div>

      {/* KPI SUMMARY & ENVIRONMENTAL MONITORING */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div onClick={() => toast.info("Accessing Inventory Intelligence")} className="cursor-pointer">
          <KPICard title="Global Inventory" value={items.length.toString()} unit="SKUS" icon={Package} trend="+12.4%" />
        </div>
        <div onClick={() => toast.info("Refining Batch Schedules")} className="cursor-pointer">
          <KPICard title="Active Batches" value={mockBatches.length.toString()} unit="UNITS" icon={Boxes} trend="Steady" />
        </div>
        <div onClick={() => toast.info("Environmental Stability Confirmed")} className="cursor-pointer">
          <KPICard 
            title="Silo Environment" 
            value={envStats.temp} 
            unit={envStats.humidity} 
            icon={Thermometer} 
            subtitle={envStats.status}
            isInfo
          />
        </div>
        <div onClick={() => toast.info("Logistics Flow Analysis")} className="cursor-pointer">
          <KPICard 
            title="Logistics Pipeline" 
            value={(mockShipments.incoming.length + mockShipments.outgoing.length).toString()} 
            unit="ACTIVE" 
            icon={Truck} 
            trend="+2 New"
          />
        </div>
      </section>

      {/* MAIN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* INVENTORY TABLE - 8 COLUMNS */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-chocolate-950/5 border border-chocolate-100/50 overflow-hidden">
            <div className="p-8 border-b border-chocolate-50 flex justify-between items-center bg-white sticky top-0 z-10">
              <h2 className="text-xl font-black text-chocolate-950 uppercase tracking-tight">Inventory Asset Hub</h2>
              <div className="flex gap-3">
                 <Button variant="ghost" size="sm" onClick={() => toast.info("Fingerprinting Report...")} className="font-black text-[10px] tracking-widest hover:bg-chocolate-50 transition-colors uppercase"><Download className="w-4 h-4 mr-2"/> Export Manifest</Button>
                 <Button onClick={() => toast.info("Opening Fabrication Wizard...")} className="bg-chocolate-950 hover:bg-chocolate-900 text-gold-400 px-8 py-6 rounded-2xl font-black text-[10px] tracking-widest shadow-xl shadow-chocolate-950/20 uppercase">+ Initiate Batch</Button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-chocolate-950 border-b border-white/5">
                  <tr className="text-[10px] font-black text-chocolate-400 uppercase tracking-[0.2em]">
                    <th className="px-8 py-4 w-1/3">Product Protocol</th>
                    <th className="px-8 py-4">Quantity</th>
                    <th className="px-8 py-4">Storage Zone</th>
                    <th className="px-8 py-4">Expiry Tracking</th>
                    <th className="px-8 py-4 text-right">Health Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-chocolate-50">
                  {items.slice(0, 8).map((item: InventoryItem, idx: number) => (
                    <tr 
                      key={item.id} 
                      onClick={() => toast.info(`Accessing Node: ${item.name}`)}
                      className={cn(
                        "hover:bg-chocolate-50/80 transition-all group cursor-pointer",
                        idx % 2 === 0 ? "bg-white" : "bg-chocolate-50/20"
                      )}
                    >
                      <td className="px-8 py-6">
                        <div className="font-black text-chocolate-950 text-sm truncate max-w-[180px] uppercase tracking-tight" title={item.name}>{item.name}</div>
                        <div className="font-mono text-[9px] text-chocolate-400 uppercase font-bold tracking-widest mt-0.5">{item.code}</div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-black text-chocolate-950">{Number(item.quantity ?? 0).toFixed(2)}</span>
                          <span className="text-[9px] text-chocolate-400 font-bold uppercase tracking-widest">{item.unit}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className="bg-white border border-chocolate-100 px-3 py-1 rounded-xl text-[10px] font-black text-chocolate-900 shadow-sm uppercase tracking-tighter">
                           {item.location ?? 'Artisan Stack'}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap font-mono text-[10px] font-bold text-chocolate-400">
                         {item.expiry_date ?? 'PERPETUAL'}
                      </td>
                      <td className="px-8 py-6 text-right whitespace-nowrap">
                        <Badge variant={item.quantity > item.reorder_level ? 'success' : 'warning'}>
                           {item.quantity > item.reorder_level ? 'OPTIONAL STOCK' : 'CRITICAL DEPLETION'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* BATCH TRACKING SECTION */}
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-chocolate-950/5 border border-chocolate-100/50 p-10 space-y-8">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500 rounded-2xl shadow-lg shadow-amber-500/20">
                  <Boxes className="w-6 h-6 text-chocolate-950" />
                </div>
                <h2 className="text-2xl font-black text-chocolate-950 uppercase tracking-tight">Batch Lifecycle Monitoring</h2>
             </div>
             
             <div className="space-y-4">
                {mockBatches.map((batch: { id: string; status: string; date: string; ingredients: string; quality: string }) => (
                   <div key={batch.id} className="border border-chocolate-50 rounded-[2.5rem] overflow-hidden group/batch">
                      <button 
                        onClick={() => setExpandedBatchId(expandedBatchId === batch.id ? null : batch.id)}
                        className="w-full flex items-center justify-between p-8 bg-chocolate-50/20 hover:bg-chocolate-50/50 transition-all"
                      >
                         <div className="flex items-center gap-8">
                            <span className="font-mono text-sm font-black text-amber-600 tracking-tighter">{batch.id}</span>
                            <span className="text-xs font-black text-chocolate-950 uppercase tracking-[0.2em]">{batch.status}</span>
                         </div>
                         <div className="flex items-center gap-6">
                            <span className="text-[10px] font-bold text-chocolate-400 uppercase tracking-widest">{batch.date}</span>
                            <div className={`p-2 rounded-full transition-transform duration-500 ${expandedBatchId === batch.id ? 'bg-chocolate-950 text-amber-500 rotate-180' : 'bg-white text-chocolate-300'}`}>
                               <ChevronDown className="w-4 h-4"/>
                            </div>
                         </div>
                      </button>
                      <AnimatePresence>
                         {expandedBatchId === batch.id && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="bg-white border-t border-chocolate-50 p-10 flex flex-wrap gap-12"
                            >
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-chocolate-400 uppercase tracking-widest">Molecular Composition</label>
                                  <p className="text-sm font-black text-chocolate-900 tracking-tight">{batch.ingredients}</p>
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-chocolate-400 uppercase tracking-widest">Sensory Score</label>
                                  <div className="flex items-center gap-3">
                                     <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                     <p className="text-lg font-black text-green-600">{batch.quality}</p>
                                  </div>
                                </div>
                                <Button onClick={() => toast.info("Authorization Required: Classified Logs Interface")} size="sm" variant="ghost" className="mt-auto ml-auto font-black text-[10px] tracking-widest uppercase hover:bg-chocolate-50">Deep Trace Logs</Button>
                            </motion.div>
                         )}
                      </AnimatePresence>
                   </div>
                ))}
             </div>
          </div>
        </div>

        {/* SIDEBAR - 4 COLUMNS: MAP, SHIPMENTS, COMPLIANCE */}
        <div className="lg:col-span-4 space-y-10">
          
          {/* SPATIAL MAP PREVIEW */}
          <div className="bg-chocolate-950 p-6 sm:p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group border border-white/5">
             <div className="absolute inset-0 bg-gold-gradient opacity-10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:opacity-20 transition-all duration-1000" />
             <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between px-2">
                   <h3 className="text-white font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-3">
                      <MapIcon className="w-5 h-5 text-amber-500" /> Spatial Logistics Map
                   </h3>
                   <span className="text-amber-500 font-mono text-[10px] tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">UTIL: 84%</span>
                </div>
                
                <div className="bg-white/5 aspect-square rounded-[2rem] border border-white/10 p-4 sm:p-6 flex items-center justify-center relative backdrop-blur-xl group-hover:border-white/20 transition-all overflow-hidden">
                   <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full h-full">
                      <div className="bg-white/10 rounded-2xl flex items-center justify-center text-[10px] font-black text-white/40 hover:bg-amber-500/20 hover:text-amber-500 hover:border-amber-500/30 transition-all cursor-pointer border border-transparent p-2 text-center leading-tight">NODE-ALPHA</div>
                      <div className="bg-amber-500/20 rounded-2xl flex items-center justify-center text-[10px] font-black text-amber-500 border-2 border-amber-500/30 cursor-pointer shadow-lg shadow-amber-500/10 rotate-1 p-2 text-center leading-tight">BOUTIQUE-B</div>
                      <div className="bg-white/10 rounded-2xl flex items-center justify-center text-[10px] font-black text-white/40 hover:bg-amber-500/20 hover:text-amber-500 transition-all cursor-pointer border border-transparent p-2 text-center leading-tight">RESERVE-X</div>
                      <div className="bg-red-500/20 rounded-2xl flex items-center justify-center text-[10px] font-black text-red-500 cursor-pointer animate-pulse border border-red-500/30 p-2 text-center leading-tight">QUARANTINE</div>
                   </div>
                </div>

                <Button onClick={() => toast.success("Spatial Matrix Decrypted")} className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-chocolate-950 border-none font-black text-[10px] tracking-[0.2em] py-6 rounded-2xl shadow-xl shadow-amber-900/40 uppercase">Initiate 3D Visualization</Button>
             </div>
          </div>

          {/* SHIPMENTS MODULE */}
          <div className="bg-white p-10 rounded-[3rem] border border-chocolate-100/50 shadow-2xl shadow-chocolate-950/5 space-y-10">
             <h3 className="text-xl font-black text-chocolate-950 uppercase tracking-tight flex items-center gap-4">
                <Truck className="w-6 h-6 text-amber-500" /> Logistics Junction
             </h3>
             
             <div className="space-y-8">
                <div>
                  <h4 className="text-[10px] font-black text-chocolate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                     <ArrowDownLeft className="w-3 h-3 text-blue-500" /> Inbound Logistics
                  </h4>
                  <div className="space-y-4">
                     {mockShipments.incoming.map((s: { id: string; supplier: string; eta: string; status: string }) => (
                        <div 
                          key={s.id} 
                          onClick={() => toast.info(`Tracing Inbound Asset: ${s.id}`)}
                          className="flex items-center justify-between p-6 bg-chocolate-50/20 rounded-2xl border border-chocolate-50 border-l-4 border-l-blue-500 cursor-pointer hover:bg-white transition-all shadow-sm hover:shadow-md"
                        >
                           <div>
                              <p className="text-[13px] font-black text-chocolate-950 uppercase leading-none mb-1">{s.supplier}</p>
                              <p className="text-[9px] font-mono text-chocolate-400 uppercase font-bold tracking-widest">{s.id}</p>
                           </div>
                           <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">ETA: {s.eta}</span>
                        </div>
                     ))}
                  </div>
                </div>

                <div className="h-[1px] bg-chocolate-50" />

                <div>
                  <h4 className="text-[10px] font-black text-chocolate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                     <ArrowUpRight className="w-3 h-3 text-amber-500" /> Outbound Chains
                  </h4>
                  <div className="space-y-4">
                     {mockShipments.outgoing.map((s: { id: string; customer: string; etd: string; status: string }) => (
                        <div 
                          key={s.id} 
                          onClick={() => toast.info(`Tracing Delivery Unit: ${s.id}`)}
                          className="flex items-center justify-between p-6 bg-chocolate-50/20 rounded-2xl border border-chocolate-50 border-l-4 border-l-amber-500 cursor-pointer hover:bg-white transition-all shadow-sm hover:shadow-md"
                        >
                           <div>
                              <p className="text-[13px] font-black text-chocolate-950 uppercase leading-none mb-1">{s.customer}</p>
                              <p className="text-[9px] font-mono text-chocolate-400 uppercase font-bold tracking-widest">{s.id}</p>
                           </div>
                           <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">ETD: {s.etd}</span>
                        </div>
                     ))}
                  </div>
                </div>
             </div>
          </div>

          {/* COMPLIANCE & AUDIT */}
          <div className="bg-white p-10 rounded-[3rem] border border-chocolate-100/50 shadow-2xl shadow-chocolate-950/5">
              <h3 className="text-xs font-black text-chocolate-950 uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
                 <ShieldCheck className="w-5 h-5 text-green-500" /> Compliance Protocols
              </h3>
              <div className="space-y-4">
                 <div 
                   onClick={() => toast.success("Validation Cipher Matching")}
                   className="flex items-center justify-between p-5 border border-chocolate-50 hover:bg-chocolate-50 transition-all cursor-pointer rounded-2xl shadow-sm"
                 >
                    <span className="text-xs font-black text-chocolate-700 uppercase tracking-tight">HACCP Certificate</span>
                    <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-lg">VERIFIED</span>
                 </div>
                 <div 
                   onClick={() => toast.info("Scheduling Logistics Audit")}
                   className="flex items-center justify-between p-5 border border-chocolate-50 hover:bg-chocolate-50 transition-all cursor-pointer rounded-2xl shadow-sm"
                 >
                    <span className="text-xs font-black text-chocolate-700 uppercase tracking-tight">Quality Audit Hub</span>
                    <span className="text-[10px] font-black text-chocolate-400 font-mono">12.04.24</span>
                 </div>
              </div>
          </div>

        </div>
      </div>

    </div>
  );
};

// --- HELPER COMPONENTS ---

interface KPICardProps {
  title: string;
  value: string;
  unit: string;
  icon: React.ElementType;
  trend?: string;
  subtitle?: string;
  isInfo?: boolean;
}

const KPICard = ({ title, value, unit, icon: Icon, trend, subtitle, isInfo = false }: KPICardProps) => (
  <motion.div 
    whileHover={{ y: -8, scale: 1.02 }}
    className={cn(
      "bg-white p-8 rounded-[2.5rem] shadow-xl shadow-chocolate-900/5 border border-chocolate-100/50 relative overflow-hidden group transition-all duration-500",
      isInfo ? "bg-blue-50/10 border-blue-500/20 shadow-blue-900/5" : ""
    )}
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-chocolate-50 opacity-0 group-hover:opacity-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-opacity duration-700" />
    
    <div className="flex items-start gap-6 relative z-10">
       <div className={cn(
         "w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg group-hover:rotate-6",
         isInfo ? "bg-blue-500 text-white shadow-blue-500/20" : "bg-chocolate-950 text-amber-500 shadow-chocolate-950/20"
       )}>
          <Icon className="w-7 h-7" />
       </div>
       
       <div className="flex-1 space-y-3">
          <h3 className="text-[10px] font-black text-chocolate-400 uppercase tracking-[0.3em]">{title}</h3>
          <div className="flex items-baseline gap-2">
             <span className="text-3xl font-black text-chocolate-950 tracking-tighter leading-none">{value}</span>
             <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{unit}</span>
          </div>
          
          {trend && (
            <div className="flex items-center gap-2 mt-2">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
               <span className="text-[9px] font-black text-chocolate-400 uppercase tracking-[0.15em]">{trend} Efficiency</span>
            </div>
          )}
          
          {subtitle && (
            <div className="flex items-center gap-2 mt-2">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
               <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.15em]">{subtitle}</span>
            </div>
          )}
       </div>
    </div>
  </motion.div>
);

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'danger' }) => {
  const styles = {
    default: 'bg-chocolate-50 text-chocolate-700 border-chocolate-100',
    success: 'bg-green-50 text-green-700 border-green-100 shadow-[0_0_20px_rgba(34,197,94,0.1)]',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    danger: 'bg-red-50 text-red-700 border-red-100',
  };
  return (
    <span className={cn("px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border whitespace-nowrap inline-flex items-center gap-2", styles[variant])}>
      {variant === 'success' && <div className="w-1 h-1 rounded-full bg-green-500" />}
      {variant === 'warning' && <div className="w-1 h-1 rounded-full bg-amber-500" />}
      {children}
    </span>
  );
};

export default WarehouseDashboard;
