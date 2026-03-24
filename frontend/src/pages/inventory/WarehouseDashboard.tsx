import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { AlertTriangle, Truck, Clock } from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
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

            {/* INVENTORY CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white">Inventory Composition</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Raw Materials', value: 400 },
                                            { name: 'Packaging', value: 300 },
                                            { name: 'Finished', value: 300 },
                                            { name: 'Spices', value: 200 },
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label
                                    >
                                        <Cell fill="#eab308" />
                                        <Cell fill="#3b82f6" />
                                        <Cell fill="#22c55e" />
                                        <Cell fill="#ef4444" />
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white">Stock Movements (7 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { name: 'Mon', in: 40, out: 24 },
                                    { name: 'Tue', in: 30, out: 13 },
                                    { name: 'Wed', in: 20, out: 58 },
                                    { name: 'Thu', in: 27, out: 39 },
                                    { name: 'Fri', in: 18, out: 48 },
                                    { name: 'Sat', in: 23, out: 38 },
                                    { name: 'Sun', in: 34, out: 43 },
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="name" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                                        cursor={{ fill: '#1e293b' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="in" fill="#22c55e" name="Stock In" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="out" fill="#ef4444" name="Stock Out" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
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
