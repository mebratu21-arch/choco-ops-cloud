import React from 'react';
import { InventoryItem } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, Package, ArrowRightLeft, ShieldCheck, Warehouse, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { SkeletonTable } from '../common/SkeletonLoader';
import EmptyState from '../common/EmptyState';
import { cn } from '../../lib/utils';

interface InventoryTableProps {
  items: InventoryItem[];
  isLoading: boolean;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onUpdateStock: (item: InventoryItem) => void;
  onAddItem?: () => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ items, isLoading, onEdit, onDelete, onUpdateStock, onAddItem }) => {
  if (isLoading) {
    return <SkeletonTable rows={10} columns={6} />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        variant="inventory"
        title="No Inventory Items"
        description="Get started by adding your first ingredient or material."
        icon={<Package className="w-8 h-8 text-amber-500" />}
        actionLabel="Add Item"
        onAction={onAddItem ?? (() => window.dispatchEvent(new CustomEvent('open-new-item-modal')))}
      />
    );
  }

  const getExpiryStatus = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 7) return { label: diffDays < 0 ? 'Expired' : 'Expiring Soon', variant: 'error' as const, icon: AlertCircle };
    if (diffDays <= 30) return { label: 'Expiring Soon', variant: 'warning' as const, icon: Clock };
    return { label: 'Valid Status', variant: 'success' as const, icon: ShieldCheck };
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity <= 0) return { label: 'Out of Stock', variant: 'out_of_stock' as const };
    if (item.quantity <= item.reorder_level) return { label: 'Critically Low', variant: 'low_stock' as const };
    return { label: 'Secure Levels', variant: 'in_stock' as const };
  };

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-4 px-4 sm:px-10">
          <thead>
            <tr className="text-white/40">
              <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.4em] min-w-[220px]">Asset Intelligence</th>
              <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.4em] min-w-[140px]">Designation</th>
              <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.4em] min-w-[140px]">Stock Metrics</th>
              <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.4em] min-w-[160px]">Sector</th>
              <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.4em] min-w-[180px]">Lifecycle</th>
              <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.4em] text-right pr-12 min-w-[150px]">Operations</th>
            </tr>
          </thead>
          <tbody className="space-y-6">
            <AnimatePresence mode='popLayout'>
              {items.map((item, idx) => {
                const expiry = getExpiryStatus(item.expiry_date);
                const stock = getStockStatus(item);

                return (
                  <motion.tr 
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.98, x: -10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ delay: idx * 0.03, duration: 0.5, ease: "easeOut" }}
                    className="group bg-[#1A0F0A]/40 hover:bg-[#1A0F0A]/80 transition-all duration-700 relative shadow-2xl backdrop-blur-md rounded-[2.5rem] border border-white/5 hover:border-amber-500/30"
                  >
                    {/* ASSET NAME & SUPPLIER */}
                    <td className="px-8 py-8 first:rounded-l-[2.5rem]">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#2A150D] to-[#0F0805] flex items-center justify-center text-amber-500 font-black text-sm border border-white/10 shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-700">
                          {item.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Link 
                            to={`/inventory/${item.id}`}
                            className="font-black text-white hover:text-amber-400 transition-colors text-lg tracking-tight leading-none"
                          >
                            {item.name}
                          </Link>
                          <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                             <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] leading-none">
                               {item.supplier_name ?? 'Internal Protocol'}
                             </p>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* CODE & CATEGORY */}
                    <td className="px-6 py-8">
                      <div className="flex flex-col gap-3">
                        <span className="font-mono text-[12px] font-black text-amber-200/80 bg-white/5 w-fit px-4 py-1.5 rounded-xl border border-white/10 shadow-inner">
                          {item.code}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-1">
                           {item.category?.replace('_', ' ')}
                        </span>
                      </div>
                    </td>

                    {/* STOCK LEVEL */}
                    <td className="px-6 py-8">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-baseline gap-3">
                           <span className={cn(
                             "text-3xl font-black tracking-tighter leading-none",
                             item.quantity <= item.reorder_level ? "text-rose-500" : "text-white"
                           )}>
                             {item.quantity}
                           </span>
                           <span className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">{item.unit}</span>
                        </div>
                        <Badge 
                          variant={stock.variant} 
                          className="w-fit text-[10px] font-black tracking-[0.2em] px-4 py-1.5 rounded-full border shadow-xl bg-white/5"
                        >
                          {stock.label}
                        </Badge>
                      </div>
                    </td>

                    {/* LOCATION */}
                    <td className="px-6 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                          <Warehouse className="w-5 h-5 text-amber-500/60" />
                        </div>
                        <div className="flex flex-col gap-1">
                           {item.location ? (
                             <span className="font-black text-[12px] text-white uppercase tracking-widest px-1">
                               {item.location}
                             </span>
                           ) : (
                             <span className="text-[11px] font-black text-white/20 uppercase italic tracking-widest">Unassigned</span>
                           )}
                           <div className="h-0.5 w-full bg-amber-500/20 rounded-full" />
                        </div>
                      </div>
                    </td>

                    {/* EXPIRY */}
                    <td className="px-6 py-8">
                       {expiry ? (
                         <div className="flex flex-col gap-3">
                            <div className={cn(
                              "flex items-center gap-3 px-4 py-2 rounded-full border-2 w-fit",
                              expiry.variant === 'success' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                              expiry.variant === 'warning' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                              "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            )}>
                               <expiry.icon className="w-4 h-4" />
                               <span className="text-[10px] font-black uppercase tracking-[0.2em]">{expiry.label}</span>
                            </div>
                            {item.expiry_date && (
                               <span className="text-[12px] font-black text-white/40 ml-1 tracking-tight">
                                 {new Date(item.expiry_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                               </span>
                            )}
                         </div>
                       ) : (
                         <span className="text-xs font-black text-white/20 uppercase tracking-[0.4em] ml-2">Permanent</span>
                       )}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-8 text-right pr-12 last:rounded-r-[2.5rem]">
                      <div className="flex items-center justify-end gap-4 opacity-40 group-hover:opacity-100 transition-all duration-700">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onUpdateStock(item)}
                          className="h-12 w-12 rounded-[1.25rem] bg-white/0 hover:bg-white/5 text-white/40 hover:text-blue-400 transition-all border border-transparent hover:border-white/10 shadow-none hover:shadow-2xl"
                          title="Transfer Logic"
                        >
                          <ArrowRightLeft className="w-6 h-6" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onEdit(item)}
                          className="h-12 w-12 rounded-[1.25rem] bg-white/0 hover:bg-white/5 text-white/40 hover:text-amber-400 transition-all border border-transparent hover:border-white/10 shadow-none hover:shadow-2xl"
                          title="Asset Mod"
                        >
                          <Edit className="w-6 h-6" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onDelete(item)}
                          className="h-12 w-12 rounded-[1.25rem] bg-white/0 hover:bg-white/5 text-white/40 hover:text-rose-400 transition-all border border-transparent hover:border-white/10 shadow-none hover:shadow-2xl"
                          title="Decommission"
                        >
                          <Trash2 className="w-6 h-6" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;
