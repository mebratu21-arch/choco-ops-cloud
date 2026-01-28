import { useManagerDashboard } from '../../services/managerService';
import { useLowStock } from '../../services/inventoryService';
import { useSOSAlerts } from '../../services/mechanicService';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { BroadcastTranslator } from '../../components/manager/BroadcastTranslator';
import { PurpleStatCard } from '../../components/dashboard/PurpleStatCard';
import { 
  BarChart3, 
  TrendingUp,
  PackageX,
  AlertTriangle,
  CheckCircle2,
  Users,
  Package,
  Factory,
  Wrench,
  ShieldCheck
} from 'lucide-react';

const ManagerDashboardPage = () => {
    const { data: dashboardData, isLoading: loadingDashboard } = useManagerDashboard();
    const { data: lowStockItems = [] } = useLowStock();
    const { data: sosAlerts = [] } = useSOSAlerts();

    if (loadingDashboard) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Use nested structure from ManagerDashboardData with safe defaults
    const stats = dashboardData || {
        inventory_summary: {
            total_items: 0,
            low_stock_count: 0,
            expiring_soon_count: 0
        },
        production_summary: {
            active_batches: 0,
            completed_today: 0,
            planned_batches: 0
        },
        qc_summary: {
            pending_inspections: 0,
            approved_today: 0,
            rejected_today: 0,
            pass_rate: 0
        },
        mechanics_summary: {
            active_alerts: 0,
            machines_operational: 0,
            machines_down: 0
        }
    };

    // Calculate metrics from nested structure with safe access
    const approvedToday = stats?.qc_summary?.approved_today ?? 0;
    const rejectedToday = stats?.qc_summary?.rejected_today ?? 0;
    const qcPassRate = (approvedToday + rejectedToday) > 0
        ? ((approvedToday / (approvedToday + rejectedToday)) * 100).toFixed(1)
        : '0.0';

    const completedToday = stats?.production_summary?.completed_today ?? 0;
    const plannedBatches = stats?.production_summary?.planned_batches ?? 0;
    const productionCompletionRate = plannedBatches > 0
        ? ((completedToday / plannedBatches) * 100).toFixed(1)
        : '0.0';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Command Center</h1>
                <p className="text-gray-500">Overview of factory operations and performance</p>
            </div>

            {/* Critical Alerts */}
            {(lowStockItems.length > 0 || sosAlerts.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lowStockItems.length > 0 && (
                        <Card className="border-amber-200 bg-amber-50">
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <PackageX className="h-6 w-6 text-amber-600" />
                                    <div className="flex-1">
                                        <p className="font-semibold text-amber-900">
                                            {lowStockItems.length} Low Stock Alert{lowStockItems.length > 1 ? 's' : ''}
                                        </p>
                                        <p className="text-sm text-amber-700">Immediate restocking required</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-amber-300 text-amber-700 hover:bg-amber-100"
                                    >
                                        View
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    
                    {sosAlerts.length > 0 && (
                        <Card className="border-red-200 bg-red-50">
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="h-6 w-6 text-red-600" />
                                    <div className="flex-1">
                                        <p className="font-semibold text-red-900">
                                            {sosAlerts.length} Urgent Machine Issue{sosAlerts.length > 1 ? 's' : ''}
                                        </p>
                                        <p className="text-sm text-red-700">Critical maintenance needed</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-red-300 text-red-700 hover:bg-red-100"
                                    >
                                        View
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* PURPOSE: PURPLE THEME STAT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <PurpleStatCard 
                    title="Weekly Production" 
                    value={`${stats?.production_summary?.completed_today || 0} Batches`}
                    subtext="Increased by 60%"
                    gradient="orange" 
                    icon={TrendingUp}
                />
                <PurpleStatCard 
                    title="Quality Orders" 
                    value={`${stats?.qc_summary?.approved_today || 0} Approved`}
                    subtext="Decreased by 10% defects"
                    gradient="blue"
                    icon={CheckCircle2} 
                />
                <PurpleStatCard 
                    title="Inventory Health" 
                    value={`${stats?.inventory_summary?.total_items || 0} Items`}
                    subtext="Increased by 5% stock"
                    gradient="green"
                    icon={Package} 
                />
            </div>

            {/* MAINTENANCE & ALERTS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Maintenance - Keeping existing Logic but updating style slightly if needed */}
                <Card className="border-none shadow-md bg-white">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-600">
                            <Wrench className="h-4 w-4" />
                            Maintenance Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                             <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-gray-800">{stats?.mechanics_summary?.active_alerts || 0}</span>
                                <span className="text-sm text-gray-500">tickets</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="text-green-500 flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    {stats?.mechanics_summary?.machines_operational} Online
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                 {/* QC Pass Rate */}
                <Card className="border-none shadow-md bg-white">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-600">
                            <ShieldCheck className="h-4 w-4" />
                            QC Pass Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="space-y-2">
                             <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-gray-800">{qcPassRate}%</span>
                                <span className="text-sm text-gray-500">success</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Performance Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Operations Summary */}
                <Card className="border-cocoa-100">
                    <CardHeader>
                        <CardTitle className="text-cocoa-900 flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-gold-600" />
                            Operations Summary
                        </CardTitle>
                        <CardDescription>Today's operational metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b border-cocoa-50">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <Factory className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-cocoa-900">Production Efficiency</p>
                                        <p className="text-sm text-slate-600">{plannedBatches} batches planned</p>
                                    </div>
                                </div>
                                <div className="text-end">
                                    <p className="text-lg font-bold text-green-600">{productionCompletionRate}%</p>
                                    <p className="text-xs text-slate-500">completion rate</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between py-3 border-b border-cocoa-50">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                                        <ShieldCheck className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-cocoa-900">Quality Score</p>
                                        <p className="text-sm text-slate-600">{stats?.qc_summary?.pending_inspections || 0} checks pending</p>
                                    </div>
                                </div>
                                <div className="text-end">
                                    <p className="text-lg font-bold text-green-600">{qcPassRate}%</p>
                                    <p className="text-xs text-slate-500">approval rate</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between py-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                        <Package className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-cocoa-900">Stock Health</p>
                                        <p className="text-sm text-slate-600">{stats?.inventory_summary?.total_items || 0} items tracked</p>
                                    </div>
                                </div>
                                <div className="text-end">
                                    <p className="text-lg font-bold text-amber-600">{stats?.inventory_summary?.low_stock_count || 0}</p>
                                    <p className="text-xs text-slate-500">need attention</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Broadcast Translator - Powered by Gemini AI */}
                <BroadcastTranslator />

                {/* Quick Actions */}
                <Card className="border-cocoa-100">
                    <CardHeader>
                        <CardTitle className="text-cocoa-900">Quick Actions</CardTitle>
                        <CardDescription>Common management tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button 
                            className="w-full justify-start bg-white hover:bg-cocoa-50 text-cocoa-900 border border-cocoa-200"
                            variant="outline"
                        >
                            <Package className="h-4 w-4 me-2" />
                            Review Low Stock Items ({stats?.inventory_summary?.low_stock_count || 0})
                        </Button>
                        
                        <Button 
                            className="w-full justify-start bg-white hover:bg-cocoa-50 text-cocoa-900 border border-cocoa-200"
                            variant="outline"
                        >
                            <Factory className="h-4 w-4 me-2" />
                            Monitor Active Batches ({stats?.production_summary?.active_batches || 0})
                        </Button>
                        
                        <Button 
                            className="w-full justify-start bg-white hover:bg-cocoa-50 text-cocoa-900 border border-cocoa-200"
                            variant="outline"
                        >
                            <ShieldCheck className="h-4 w-4 me-2" />
                            Review QC Reports
                        </Button>
                        
                        <Button 
                            className="w-full justify-start bg-white hover:bg-cocoa-50 text-cocoa-900 border border-cocoa-200"
                            variant="outline"
                        >
                            <Wrench className="h-4 w-4 me-2" />
                            Check Maintenance Issues ({stats?.mechanics_summary?.active_alerts || 0})
                        </Button>
                        
                        <Button 
                            className="w-full justify-start bg-gold-500 hover:bg-gold-600 text-white"
                        >
                            <Users className="h-4 w-4 me-2" />
                            Create Announcement
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ManagerDashboardPage;
