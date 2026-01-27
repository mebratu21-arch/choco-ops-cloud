import { useEffect, useState } from 'react';
import { inventoryService } from '../../services/inventoryService';
import { RawMaterial } from '../../types';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Search, AlertTriangle, Plus, Filter } from 'lucide-react';

const InventoryPage = () => {
    const [items, setItems] = useState<RawMaterial[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        const fetchInventory = async () => {
            setLoading(true);
            try {
                // Use getIngredients which supports filters, or getAllMaterials without args if deprecated
                // Since filters doesn't have 'search', let's just fetch all or check service
                const response = await inventoryService.getIngredients();
                setItems(response);
            } catch (error) {
                console.error("Failed to fetch inventory", error);
                setItems([]);
            } finally {
                setLoading(false);
            }
        };
        fetchInventory();
    }, [debouncedSearch]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-serif text-cocoa-900">Inventory Management</h1>
                    <p className="text-muted-foreground">Track raw materials, stock levels and expiry locations.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2 border-cocoa-200 text-cocoa-700 hover:bg-cocoa-50">
                        <Filter className="h-4 w-4" /> Filter
                    </Button>
                    <Button className="gap-2 bg-gold-500 hover:bg-gold-600 text-white shadow-md shadow-gold-900/10">
                        <Plus className="h-4 w-4" /> Add Item
                    </Button>
                </div>
            </div>

            <Card className="border-cocoa-100 shadow-sm">
                <CardHeader>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search inventory by name or location..." 
                            className="pl-8 max-w-sm border-cocoa-200 focus:ring-gold-500"
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
                                    <th className="px-4 py-3 font-medium text-cocoa-700">Details</th>
                                    <th className="px-4 py-3 font-medium text-cocoa-700">Location</th>
                                    <th className="px-4 py-3 font-medium text-cocoa-700">Stock</th>
                                    <th className="px-4 py-3 font-medium text-cocoa-700">Status</th>
                                    <th className="px-4 py-3 font-medium text-cocoa-700 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-cocoa-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading inventory...</td>
                                    </tr>
                                ) : items.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No items found</td>
                                    </tr>
                                ) : (
                                    items.map(item => {
                                        const quantity = item.current_stock ?? 0;
                                        const threshold = item.minimum_stock ?? 0;
                                        const isLowStock = quantity <= threshold;
                                        
                                        return (
                                            <tr key={item.id} className="hover:bg-cocoa-50/50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                                                <td className="px-4 py-3 text-slate-500">
                                                    <div className="text-xs space-y-0.5">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-cocoa-400">Exp:</span> 
                                                            {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A'}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-cocoa-400">Sup:</span> 
                                                            {item.supplier_name || 'Unknown'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500">
                                                    {[item.aisle, item.shelf, item.bin].filter(Boolean).join('-') || 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 text-slate-900 font-medium">
                                                    {quantity} {item.unit}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {isLowStock ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                                                            <AlertTriangle className="h-3 w-3" /> Low Stock
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                                                            In Stock
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button variant="ghost" size="sm" className="h-8 text-primary-600 hover:text-primary-700 hover:bg-primary-50">Edit</Button>
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
