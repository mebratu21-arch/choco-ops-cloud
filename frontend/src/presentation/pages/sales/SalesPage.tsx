import { useState } from 'react';
import { useSales } from '../../hooks/useSales';
import { useInventory } from '../../hooks/useInventory';
import { Plus, Minus, Trash2, Loader2, ShoppingCart, CreditCard, Tag, User, Package, Calendar, ChevronRight, TrendingUp } from 'lucide-react';
import { InventoryItem } from '../../../domain/models/InventoryItem';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { toast } from 'sonner';

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

export default function SalesPage() {
  const { orders, isLoadingOrders, recordSale } = useSales({ page: 1, limit: 15 });
  const { items: inventory, isLoading: isLoadingInventory } = useInventory({ limit: 100 }); 

  const [cart, setCart] = useState<{ item: InventoryItem; quantity: number }[]>([]);
  const [employeeId, setEmployeeId] = useState('');
  const [discount, setDiscount] = useState(0);

  const addToCart = (item: InventoryItem) => {
     setCart(prev => {
         const existing = prev.find(i => i.item.id === item.id);
         if (existing) {
             return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
         }
         return [...prev, { item, quantity: 1 }];
     });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
        if (i.item.id === id) {
             return { ...i, quantity: Math.max(0, i.quantity + delta) };
        }
        return i;
    }).filter(i => i.quantity > 0));
  };
  
  const removeItem = (id: string) => setCart(prev => prev.filter(i => i.item.id !== id));

  const handleRecordSale = async () => {
      try {
          await recordSale({
              employeeId,
              discountPercentage: discount,
              items: cart.map(i => ({ inventoryId: i.item.id, quantity: i.quantity }))
          });
          setCart([]);
          setEmployeeId('');
          setDiscount(0);
          toast.success('Sale successfully archived in ledger');
      } catch (e) {
          console.error(e);
          toast.error('Synchronization failed: Ledger inaccessible');
      }
  };

  const subtotal = cart.reduce((sum, i) => sum + (i.item.price || 0) * i.quantity, 0);
  const total = subtotal * (1 - discount / 100);

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
                  <CreditCard className="w-7 h-7 text-gold-400" />
               </div>
               <span className="text-gold-500 text-[10px] font-black tracking-[0.3em] uppercase">Point of Transaction</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-white tracking-tighter leading-none uppercase">
              Sales <br /> <span className="text-gold-500">Terminal</span>
            </h1>
            <p className="text-chocolate-300 font-bold mt-4 uppercase tracking-[0.2em] text-[10px] border-l-2 border-chocolate-800 pl-6">Real-time revenue orchestration & inventory reconciliation</p>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Product Selection */}
          <motion.div variants={itemVariants} className="lg:col-span-8 space-y-8">
            <div className="glass-panel p-8 rounded-[3rem] border-white/5 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 blur-[100px] group-hover:bg-gold-500/10 transition-colors" />
               <div className="flex items-center justify-between mb-8 relative z-10">
                  <h3 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-3">
                    <Package className="w-5 h-5 text-gold-500" />
                    Available Inventory
                  </h3>
                  <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                     <span className="text-[10px] font-black text-chocolate-400 tracking-widest uppercase">Stock Pulse:</span>
                     <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black text-white tracking-widest uppercase">OPTIMAL</span>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-h-[600px] overflow-y-auto pr-2 scrollbar-premium relative z-10">
                  {isLoadingInventory ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4">
                       <Loader2 className="w-12 h-12 animate-spin text-gold-500" />
                       <span className="text-[10px] font-black text-chocolate-500 uppercase tracking-widest">Sequencing Catalog...</span>
                    </div>
                  ) : inventory.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => addToCart(item)}
                      className="group/card glass-panel-light p-6 rounded-[2.5rem] border-white/5 hover:border-gold-500/30 transition-all duration-500 cursor-pointer shadow-xl hover:shadow-gold-500/5 relative overflow-hidden"
                    >
                       <div className="absolute bottom-[-20%] left-[-10%] w-32 h-32 bg-gold-500/5 rounded-full blur-2xl group-hover/card:bg-gold-500/10 transition-colors" />
                       <div className="flex flex-col gap-4 relative z-10">
                          <div className="flex justify-between items-start">
                             <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover/card:rotate-6 transition-transform">
                                <Package className="w-6 h-6 text-chocolate-400 group-hover/card:text-gold-400 transition-colors" />
                             </div>
                             <div className="text-right">
                                <div className="text-xs font-black text-gold-500 tracking-tight">${item.price?.toFixed(2)}</div>
                                <div className="text-[8px] font-black text-chocolate-500 uppercase tracking-widest mt-1">Ref No: #{item.id.slice(-4)}</div>
                             </div>
                          </div>
                          <div>
                             <h4 className="font-black text-white text-base leading-tight group-hover/card:text-gold-500 transition-colors truncate">{item.name}</h4>
                             <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] font-black text-chocolate-400 uppercase tracking-widest">{item.current_stock} {item.unit}</span>
                                <div className="w-1 h-1 rounded-full bg-chocolate-700" />
                                <span className={cn("text-[9px] font-black uppercase tracking-widest", item.current_stock < 20 ? "text-red-400" : "text-green-500")}>
                                   {item.current_stock < 20 ? "LOW RESERVE" : "READY"}
                                </span>
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>

          {/* Cart & Checkout */}
          <motion.div variants={itemVariants} className="lg:col-span-4 flex flex-col gap-8">
            <div className="glass-panel p-8 rounded-[3.5rem] border-white/5 shadow-2xl flex flex-col relative overflow-hidden group min-h-[700px]">
               <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-gold-500/5 to-transparent pointer-events-none" />
               <div className="flex items-center justify-between mb-8 relative z-10">
                  <h3 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-3">
                    <ShoppingCart className="w-5 h-5 text-gold-500" />
                    Archive Cart
                  </h3>
                  <div className="w-8 h-8 rounded-full bg-gold-500 text-chocolate-950 flex items-center justify-center text-[10px] font-black shadow-[0_0_10px_#cf9a3c]">
                    {cart.length}
                  </div>
               </div>

               <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-premium relative z-10">
                  {cart.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-chocolate-600 space-y-4 opacity-50">
                       <ShoppingCart className="w-16 h-16" />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em]">Awaiting Transactions...</span>
                    </div>
                  )}
                  <AnimatePresence>
                    {cart.map(({ item, quantity }) => (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="group/item glass-panel-light p-5 rounded-[2rem] border-white/5 hover:border-white/10 transition-colors"
                      >
                         <div className="flex justify-between items-start mb-4">
                            <div className="min-w-0 flex-1">
                               <h4 className="font-black text-white text-sm truncate uppercase tracking-tight">{item.name}</h4>
                               <p className="text-[9px] font-black text-chocolate-500 uppercase tracking-widest mt-1">${item.price?.toFixed(2)} / unit</p>
                            </div>
                            <button onClick={() => removeItem(item.id)} className="p-2 text-chocolate-500 hover:text-red-400 transition-colors">
                               <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                         <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3 bg-chocolate-950 p-1.5 rounded-2xl border border-white/5">
                               <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                                  <Minus className="w-3 h-3 text-gold-500" />
                               </button>
                               <span className="w-8 text-center text-xs font-black tabular-nums">{quantity}</span>
                               <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                                  <Plus className="w-3 h-3 text-gold-500" />
                               </button>
                            </div>
                            <div className="text-right">
                               <div className="text-[9px] font-black text-chocolate-500 uppercase tracking-widest mb-0.5">Line Total</div>
                               <div className="text-sm font-black text-gold-500 tracking-tight">${((item.price || 0) * quantity).toFixed(2)}</div>
                            </div>
                         </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
               </div>

               <div className="mt-8 space-y-6 bg-white/5 p-8 -mx-8 -mb-8 border-t border-white/5 relative z-10 backdrop-blur-xl">
                  <div className="space-y-4">
                     <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-chocolate-500 group-focus-within:text-gold-500 transition-colors" />
                        <input 
                           className="w-full bg-chocolate-950/50 border border-white/5 focus:border-gold-500/50 rounded-2xl py-4 pl-12 pr-4 text-xs font-black placeholder:text-chocolate-800 focus:outline-none transition-all" 
                           placeholder="EMPLOYEE IDENTIFIER" 
                           value={employeeId} 
                           onChange={e => setEmployeeId(e.target.value)} 
                        />
                     </div>
                     <div className="relative group">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-chocolate-500 group-focus-within:text-gold-500 transition-colors" />
                        <input 
                           type="number"
                           className="w-full bg-chocolate-950/50 border border-white/5 focus:border-gold-500/50 rounded-2xl py-4 pl-12 pr-4 text-xs font-black placeholder:text-chocolate-800 focus:outline-none transition-all" 
                           placeholder="DISCOUNT ENTITLEMENT %" 
                           value={discount || ''} 
                           onChange={e => setDiscount(Number(e.target.value))} 
                        />
                     </div>
                  </div>

                  <div className="space-y-3 pt-4">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-chocolate-400">
                        <span>Aggregate Subtotal</span>
                        <span className="text-white">${subtotal.toFixed(2)}</span>
                     </div>
                     {discount > 0 && (
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-green-500">
                           <span>Discount Deduction</span>
                           <span>-${(subtotal * discount / 100).toFixed(2)}</span>
                        </div>
                     )}
                     <div className="flex justify-between items-end pt-2 border-t border-white/5">
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-gold-500 mb-1">Final Total</span>
                        <span className="text-3xl font-black text-white tabular-nums tracking-tighter">${total.toFixed(2)}</span>
                     </div>
                  </div>

                  <button 
                     onClick={handleRecordSale}
                     disabled={cart.length === 0 || !employeeId}
                     className="w-full py-6 rounded-[2rem] bg-gold-500 hover:bg-gold-400 disabled:bg-chocolate-900 disabled:text-chocolate-700 disabled:cursor-not-allowed text-chocolate-950 font-black text-xs tracking-[0.4em] uppercase transition-all duration-700 shadow-2xl shadow-gold-500/10 active:scale-95 group/btn overflow-hidden relative"
                  >
                     <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                     <span className="relative z-10 flex items-center justify-center gap-3">
                        {cart.length > 0 ? <CreditCard className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />}
                        Execute Settlement
                     </span>
                  </button>
               </div>
            </div>
          </motion.div>
        </div>

        {/* Ledger History */}
        <motion.div variants={itemVariants} className="pb-20">
           <div className="glass-panel rounded-[3.5rem] border-white/5 shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 blur-[120px] pointer-events-none" />
              <div className="p-10 border-b border-white/5 flex items-center justify-between relative z-10">
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3 uppercase">
                      <Calendar className="w-6 h-6 text-gold-500" />
                      Digital Ledger
                    </h2>
                    <p className="text-[10px] font-black text-chocolate-500 tracking-[0.2em] uppercase mt-1">Audit trail: Recent stream transactions</p>
                  </div>
                  <div className="flex items-center gap-6">
                     <div className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                        <span className="text-[10px] font-black text-chocolate-400 uppercase tracking-widest">Aggregate Daily:</span>
                        <span className="text-sm font-black text-gold-500">$18,450.00</span>
                     </div>
                  </div>
              </div>
              <div className="overflow-x-auto relative z-10">
                 {isLoadingOrders ? (
                   <div className="p-20 flex flex-col items-center justify-center gap-6">
                      <div className="w-16 h-16 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
                      <span className="text-[10px] font-black text-chocolate-500 uppercase tracking-[0.2em]">Synchronizing Ledger Stream...</span>
                   </div>
                 ) : (
                   <table className="w-full text-left">
                      <thead>
                         <tr className="bg-white/2 border-b border-white/5">
                            <th className="px-10 py-6 text-[10px] font-black text-chocolate-300 uppercase tracking-[0.3em]">Identifier</th>
                            <th className="px-10 py-6 text-[10px] font-black text-chocolate-300 uppercase tracking-[0.3em]">Customer Node</th>
                            <th className="px-10 py-6 text-[10px] font-black text-chocolate-300 uppercase tracking-[0.3em]">Quantum Total</th>
                            <th className="px-10 py-6 text-[10px] font-black text-chocolate-300 uppercase tracking-[0.3em]">Sync Status</th>
                            <th className="px-10 py-6 text-[10px] font-black text-chocolate-300 uppercase tracking-[0.3em]">Timestamp</th>
                            <th className="px-10 py-6"></th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/2">
                         {orders.map(order => (
                            <tr key={order.id} className="group/row hover:bg-white/5 transition-all duration-300 cursor-pointer">
                               <td className="px-10 py-6">
                                  <div className="flex items-center gap-3">
                                     <div className="w-2 h-2 rounded-full bg-gold-500 shadow-[0_0_8px_#cf9a3c]" />
                                     <span className="text-xs font-black text-white tracking-widest uppercase">#{order.id.split('-')[0]}</span>
                                  </div>
                               </td>
                               <td className="px-10 py-6 text-xs font-bold text-chocolate-300">{order.customer_name}</td>
                               <td className="px-10 py-6">
                                  <span className="text-sm font-black text-white tabular-nums">${order.total.toFixed(2)}</span>
                               </td>
                               <td className="px-10 py-6">
                                  <span className={cn(
                                    "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                    order.status === 'DELIVERED' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                    order.status === 'PENDING' ? "bg-gold-500/10 text-gold-500 border-gold-500/20" :
                                    "bg-white/5 text-chocolate-400 border-white/10"
                                  )}>
                                     {order.status}
                                  </span>
                               </td>
                               <td className="px-10 py-6 text-[10px] font-black text-chocolate-500 uppercase tracking-widest">
                                  {new Date(order.created_at).toLocaleDateString()}
                               </td>
                               <td className="px-10 py-6 text-right">
                                  <button className="p-3 bg-white/5 rounded-xl text-chocolate-600 hover:bg-gold-500 hover:text-chocolate-950 transition-all duration-500 group-hover/row:translate-x-1">
                                     <ChevronRight className="w-4 h-4" />
                                  </button>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                 )}
              </div>
           </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
