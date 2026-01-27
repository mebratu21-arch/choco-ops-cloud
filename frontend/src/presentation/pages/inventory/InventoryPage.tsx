import { useState } from 'react';
import { useInventory } from '../../hooks/useInventory';
import { Search, AlertTriangle, ArrowUpDown, Loader2, Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { InventoryItem } from '../../../domain/models/InventoryItem';

export default function InventoryPage() {
  const limit = 15;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number | ''>('');

  const { 
    items, 
    pagination, 
    isLoading, 
    error, 
    updateStock, 
    isUpdating 
  } = useInventory({
    page,
    limit,
    search: search || undefined,
    low_stock: lowStockOnly, // Ensure simple parameter name match
    sortBy: sortBy || undefined,
    sortDir: sortBy ? sortDir : undefined,
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
    setPage(1);
  };

  const startEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditValue(item.current_stock);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleSaveEdit = async (id: string) => {
    if (editValue === '' || isNaN(Number(editValue))) return;

    try {
      await updateStock({ id, quantity: Number(editValue) });
      toast.success('Stock updated');
      setEditingId(null);
      setEditValue('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update stock');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-serif font-bold text-primary">Inventory Management</h1>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-64 pl-4 pr-10 py-2 border rounded bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <label className="flex items-center gap-2 whitespace-nowrap cursor-pointer">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => {
                setLowStockOnly(e.target.checked);
                setPage(1);
              }}
              className="h-4 w-4 text-primary rounded border-input"
            />
            <span className="text-sm font-medium">Low stock only</span>
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive text-center">
          Failed to load inventory
        </div>
      )}

      <div className="bg-card shadow rounded-lg overflow-hidden border border-border">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                onClick={() => handleSort('name')}
              >
                Name / SKU
                {sortBy === 'name' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                onClick={() => handleSort('current_stock')}
              >
                Current Stock
                {sortBy === 'current_stock' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Min Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Unit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="h-32 text-center">
                  <Loader2 className="inline animate-spin h-8 w-8 text-primary" />
                  <span className="ml-2">Loading inventory...</span>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="h-32 text-center text-muted-foreground">
                  No items found
                </td>
              </tr>
            ) : (
              items.map(item => {
                const isLow = item.current_stock <= item.minimum_stock;
                const isEditing = editingId === item.id;

                return (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-foreground">{item.name}</div>
                      <div className="text-sm text-muted-foreground">{item.sku}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editValue}
                            onChange={e => setEditValue(Number(e.target.value))}
                            className="w-24 px-2 py-1 border rounded bg-input text-foreground"
                            min={0}
                            step="0.01"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="text-green-600 hover:text-green-800 disabled:opacity-50"
                            disabled={isUpdating}
                          >
                            <Save size={18} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={isLow ? 'text-destructive font-medium' : ''}>{item.current_stock.toFixed(2)}</span>
                          <button
                            onClick={() => startEdit(item)}
                            className="text-primary hover:text-primary/80"
                          >
                            <Edit2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {item.minimum_stock.toFixed(2)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {item.unit}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {isLow ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                          <AlertTriangle size={14} className="mr-1" />
                          Low
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          OK
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1 || isLoading}
          className="px-6 py-2 border rounded disabled:opacity-50 hover:bg-muted"
        >
          Previous
        </button>
        <span className="py-2 px-4">Page {page} of {pagination?.totalPages || 1}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={page === (pagination?.totalPages || 1) || isLoading}
          className="px-6 py-2 border rounded disabled:opacity-50 hover:bg-muted"
        >
          Next
        </button>
      </div>
    </div>
  );
}

