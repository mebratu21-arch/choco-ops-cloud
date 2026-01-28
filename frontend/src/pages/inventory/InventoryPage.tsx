import { useState } from 'react';
import { useIngredients, useLowStock, useExpiringSoon, useUpdateStock } from '../../services/inventoryService';
import { Ingredient, InventoryFilters } from '../../types';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Search, AlertTriangle, Plus, Filter, Package, Calendar, TrendingDown, Edit2, Check, X } from 'lucide-react';

type FilterView = 'all' | 'low-stock' | 'expiring';

const InventoryPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterView, setFilterView] = useState<FilterView>('all');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editStock, setEditStock] = useState<number>(0);
    
    // React Query hooks
    const { data: allItems = [], isLoading: loadingAll } = useIngredients();
    const { data: lowStockItems = [], isLoading: loadingLow } = useLowStock();
    const { data: expiringItems = [], isLoading: loadingExpiring } = useExpiringSoon(30);
    const { mutate: updateStock, isPending: isUpdating } = useUpdateStock();

    // Determine which data to show
    const getFilteredData = (): Ingredient[] => {
        let data: Ingredient[] = [];
        
        switch (filterView) {
            case 'low-stock':
                data = lowStockItems;
                break;
            case 'expiring':
                data = expiringItems;
                break;
            default:
                data = allItems;
        }

        // Apply search filter
        if (searchTerm) {
            return data.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                [item.aisle, item.shelf, item.bin].filter(Boolean).join('-').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return data;
    };

    const items = getFilteredData();
    const isLoading = loadingAll || loadingLow || loadingExpiring;

    const handleEdit = (item: Ingredient) => {
        setEditingId(item.id);
        setEditStock(item.current_stock);
    };

    const handleSave = (id: string) => {
        updateStock(
            { id, current_stock: editStock, reason: 'Manual stock update from warehouse' },
            {
                onSuccess: () => {
                    setEditingId(null);
                },
            }
        );
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditStock(0);
    };

    const getStockStatus = (item: Ingredient) => {
        const stock = item.current_stock;
        const min = item.minimum_stock;
        const optimal = item.optimal_stock;

        if (stock < min) {
            return { label: 'Critical', color: 'bg-red-100 text-red-700', icon: AlertTriangle };
        } else if (stock < optimal) {
            return { label: 'Low Stock', color: 'bg-amber-100 text-amber-700', icon: TrendingDown };
        }
        return { label: 'In Stock', color: 'bg-green-100 text-green-700', icon: Package };
    };

    const getExpiryStatus = (expiryDate: string | null) => {
        if (!expiryDate) return null;

        const now = new Date();
        const expiry = new Date(expiryDate);
        const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry < 0) {
            return { label: 'Expired', color: 'text-red-600 font-semibold' };
        } else if (daysUntilExpiry <= 7) {
            return { label: `${daysUntilExpiry}d`, color: 'text-red-600' };
        } else if (daysUntilExpiry <= 30) {
            return { label: `${daysUntilExpiry}d`, color: 'text-amber-600' };
        }
        return { label: new Date(expiryDate).toLocaleDateString(), color: 'text-slate-500' };
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-serif text-cocoa-900">Inventory Management</h1>
                    <p className="text-muted-foreground">Track raw materials, stock levels, and expiry dates</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2 border-cocoa-200 text-cocoa-700 hover:bg-cocoa-50">
                        <Plus className="h-4 w-4" /> Add Item
                    </Button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
                <Button
                    variant={filterView === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilterView('all')}
                    className={filterView === 'all' ? 'bg-cocoa-700 hover:bg-cocoa-800' : 'border-cocoa-200 text-cocoa-700 hover:bg-cocoa-50'}
                >
                    <Package className="h-4 w-4 me-2" />
                    All Items ({allItems.length})
                </Button>
                <Button
                    variant={filterView === 'low-stock' ? 'default' : 'outline'}
                    onClick={() => setFilterView('low-stock')}
                    className={filterView === 'low-stock' ? 'bg-amber-600 hover:bg-amber-700' : 'border-amber-200 text-amber-700 hover:bg-amber-50'}
                >
                    <TrendingDown className="h-4 w-4 me-2" />
                    Low Stock ({lowStockItems.length})
                </Button>
                <Button
                    variant={filterView === 'expiring' ? 'default' : 'outline'}
                    onClick={() => setFilterView('expiring')}
                    className={filterView === 'expiring' ? 'bg-red-600 hover:bg-red-700' : 'border-red-200 text-red-700 hover:bg-red-50'}
                >
                    <Calendar className="h-4 w-4 me-2" />
                    Expiring Soon ({expiringItems.length})
                </Button>
            </div>

            {/* Main Card */}
            <Card className="border-cocoa-100 shadow-sm">
                <CardHeader>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by name, code, or location..." 
                            className="ps-8 max-w-sm border-cocoa-200 focus:ring-gold-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-cocoa-100 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-cocoa-50 border-b border-cocoa-100">
                                <tr>
                                    <th className="px-4 py-3 font-medium text-cocoa-700">Item Name</th>
                                    <th className="px-4 py-3 font-medium text-cocoa-700">Code</th>
                                    <th className="px-4 py-3 font-medium text-cocoa-700">Location</th>
                                    <th className="px-4 py-3 font-medium text-cocoa-700">Stock</th>
                                    <th className="px-4 py-3 font-medium text-cocoa-700">Expiry</th>
                                    <th className="px-4 py-3 font-medium text-cocoa-700">Status</th>
                                    <th className="px-4 py-3 font-medium text-cocoa-700 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-cocoa-50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                            Loading inventory...
                                        </td>
                                    </tr>
                                ) : items.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                            No items found
                                        </td>
                                    </tr>
                                ) : (
                                    items.map(item => {
                                        const stockStatus = getStockStatus(item);
                                        const expiryStatus = getExpiryStatus(item.expiry_date);
                                        const StatusIcon = stockStatus.icon;
                                        const isEditing = editingId === item.id;
                                        
                                        return (
                                            <tr key={item.id} className="hover:bg-cocoa-50/50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                                                <td className="px-4 py-3 text-slate-500 font-mono text-xs">{item.code || 'N/A'}</td>
                                                <td className="px-4 py-3 text-slate-500">
                                                    {[item.aisle, item.shelf, item.bin].filter(Boolean).join('-') || 'N/A'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {isEditing ? (
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type="number"
                                                                value={editStock}
                                                                onChange={(e) => setEditStock(Number(e.target.value))}
                                                                className="w-20 h-8"
                                                                disabled={isUpdating}
                                                            />
                                                            <span className="text-sm text-slate-600">{item.unit}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-900 font-medium">
                                                            {item.current_stock} {item.unit}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {expiryStatus && (
                                                        <span className={expiryStatus.color}>
                                                            {expiryStatus.label}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${stockStatus.color}`}>
                                                        <StatusIcon className="h-3 w-3" />
                                                        {stockStatus.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {isEditing ? (
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                onClick={() => handleSave(item.id)}
                                                                disabled={isUpdating}
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                onClick={handleCancel}
                                                                disabled={isUpdating}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 gap-1 text-gold-600 hover:text-gold-700 hover:bg-gold-50"
                                                            onClick={() => handleEdit(item)}
                                                        >
                                                            <Edit2 className="h-3 w-3" />
                                                            Edit
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default InventoryPage;

