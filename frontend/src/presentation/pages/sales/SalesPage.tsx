import { useState } from 'react';
import { useSales } from '../../hooks/useSales';
import { useInventory } from '../../hooks/useInventory';
import { Plus, Minus, Trash2, Loader2 } from 'lucide-react';
import { InventoryItem } from '../../../domain/models/InventoryItem';

export default function SalesPage() {
  const { orders, isLoadingOrders, recordSale } = useSales({ page: 1, limit: 15 });
  // Fetch ample inventory for the dropdown/grid
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
          alert('Sale recorded!');
      } catch (e) {
          console.error(e);
          alert('Failed to record sale');
      }
  };

  const subtotal = cart.reduce((sum, i) => sum + (i.item.price || 0) * i.quantity, 0);
  const total = subtotal * (1 - discount / 100);

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-serif font-bold text-primary">Sales Management</h1>
      
      {/* Sales Recording UI */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-card p-6 rounded-lg shadow border border-border">
           <h2 className="text-xl font-semibold mb-4 text-primary font-serif">New Sale</h2>
           <div className="space-y-4">
               <div>
                   <label className="text-sm font-medium mb-1 block">Employee ID</label>
                   <input 
                      className="w-full p-2 border rounded bg-input text-foreground" 
                      placeholder="e.g. EMP-001" 
                      value={employeeId} 
                      onChange={e => setEmployeeId(e.target.value)} 
                   />
               </div>
               <div>
                   <label className="text-sm font-medium mb-1 block">Discount %</label>
                   <input 
                      type="number" 
                      className="w-full p-2 border rounded bg-input text-foreground" 
                      value={discount} 
                      onChange={e => setDiscount(Number(e.target.value))} 
                      min="0" max="100"
                   />
               </div>
               
               {/* Product Grid */}
               <div>
                   <label className="text-sm font-medium mb-1 block">Select Products</label>
                   <div className="h-64 overflow-y-auto border rounded p-2 grid grid-cols-2 gap-2 bg-muted/20">
                       {isLoadingInventory ? <div className="col-span-2 flex justify-center p-4"><Loader2 className="animate-spin text-primary" /></div> : 
                         inventory.map(item => (
                             <div key={item.id} className="p-3 border rounded hover:bg-muted cursor-pointer transition-colors bg-card" onClick={() => addToCart(item)}>
                                 <div className="font-medium truncate">{item.name}</div>
                                 <div className="text-sm text-secondary font-bold">${(item.price || 0).toFixed(2)}</div>
                                 <div className="text-xs text-muted-foreground">{item.current_stock} {item.unit}</div>
                             </div>
                         ))
                       }
                   </div>
               </div>
           </div>
        </div>

        {/* Cart */}
         <div className="bg-card p-6 rounded-lg shadow border border-border flex flex-col">
             <h2 className="text-xl font-semibold mb-4 text-primary font-serif">Cart Summary</h2>
             <div className="space-y-2 flex-grow overflow-y-auto max-h-96">
                 {cart.length === 0 && <div className="text-center text-muted-foreground py-8">Cart is empty</div>}
                 {cart.map(({ item, quantity }) => (
                     <div key={item.id} className="flex justify-between items-center p-2 border-b">
                         <div>
                             <div className="font-medium">{item.name}</div>
                             <div className="text-sm text-muted-foreground">${(item.price || 0).toFixed(2)} x {quantity}</div>
                         </div>
                         <div className="flex items-center gap-2">
                             <div className="flex border rounded">
                                 <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-muted"><Minus size={14} /></button>
                                 <span className="w-8 text-center text-sm leading-6">{quantity}</span>
                                 <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-muted"><Plus size={14} /></button>
                             </div>
                             <button onClick={() => removeItem(item.id)} className="text-destructive hover:bg-destructive/10 p-1 rounded"><Trash2 size={16} /></button>
                         </div>
                     </div>
                 ))}
             </div>
             <div className="mt-4 border-t pt-4 bg-muted/10 -mx-6 px-6 -mb-6 pb-6 rounded-b-lg">
                 <div className="flex justify-between text-sm mb-2">
                     <span>Subtotal</span>
                     <span>${subtotal.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-sm mb-2 text-green-600">
                     <span>Discount ({discount}%)</span>
                     <span>-${(subtotal * discount / 100).toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between font-bold text-lg text-primary">
                     <span>Total</span>
                     <span>${total.toFixed(2)}</span>
                 </div>
                 <button 
                    onClick={handleRecordSale}
                    className="w-full mt-4 bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium"
                    disabled={cart.length === 0 || !employeeId}
                 >
                     Complete Sale
                 </button>
             </div>
         </div>
      </div>

      {/* Online Orders */}
      <div className="bg-card rounded-lg shadow border border-border overflow-hidden">
          <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-primary font-serif">Recent Online Orders</h2>
          </div>
          <div className="overflow-x-auto">
              {isLoadingOrders ? <div className="p-12 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div> : 
                 <table className="w-full text-sm">
                     <thead className="bg-muted/50">
                         <tr className="text-left">
                             <th className="px-6 py-3 font-medium text-muted-foreground uppercase tracking-wider">ID</th>
                             <th className="px-6 py-3 font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                             <th className="px-6 py-3 font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                             <th className="px-6 py-3 font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                             <th className="px-6 py-3 font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-border">
                         {orders.map(order => (
                             <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                                 <td className="px-6 py-4 font-mono text-xs">{order.id.split('-')[0]}...</td>
                                 <td className="px-6 py-4">{order.customer_name}</td>
                                 <td className="px-6 py-4 font-medium">${order.total.toFixed(2)}</td>
                                 <td className="px-6 py-4">
                                     <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                         order.status === 'DELIVERED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                         order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                                         'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                     }`}>
                                         {order.status}
                                     </span>
                                 </td>
                                 <td className="px-6 py-4 text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
              }
          </div>
      </div>
    </div>
  );
}
