import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { AlertTriangle, Truck, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const WarehouseDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white font-serif tracking-tight">Warehouse Command Center</h2>
                    <p className="text-slate-400">Inventory Status & Logistics</p>
                </div>
                <Button onClick={() => navigate('/inventory')} variant="default" className="bg-gold-600 hover:bg-gold-700 text-black">
                    Manage Full Inventory
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-900 border-slate-800 border-l-4 border-l-red-500">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 font-medium">Critical Stock</span>
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="text-3xl font-bold text-white">3</div>
                        <p className="text-xs text-red-400 mt-1">Below safety threshold</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 border-l-4 border-l-yellow-500">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 font-medium">Expiring Soon</span>
                            <Clock className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div className="text-3xl font-bold text-white">12</div>
                        <p className="text-xs text-yellow-400 mt-1">Within 30 days</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 font-medium">Incoming</span>
                            <Truck className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="text-3xl font-bold text-white">2</div>
                        <p className="text-xs text-blue-400 mt-1">Deliveries expected today</p>
                    </CardContent>
                </Card>
            </div>

            {/* Incoming Deliveries Table */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white">Scheduled Deliveries</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-300">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-950/50">
                                <tr>
                                    <th className="px-6 py-3">Supplier</th>
                                    <th className="px-6 py-3">Items</th>
                                    <th className="px-6 py-3">ETA</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-slate-800 hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-medium text-white">Global Cocoa Ltd</td>
                                    <td className="px-6 py-4">Cocoa Mass (500kg)</td>
                                    <td className="px-6 py-4">14:00 Today</td>
                                    <td className="px-6 py-4"><span className="text-blue-400">In Transit</span></td>
                                </tr>
                                <tr className="border-b border-slate-800 hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-medium text-white">SugarRefine Co</td>
                                    <td className="px-6 py-4">White Sugar (1000kg)</td>
                                    <td className="px-6 py-4">09:00 Tomorrow</td>
                                    <td className="px-6 py-4"><span className="text-yellow-400">Scheduled</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default WarehouseDashboard;
