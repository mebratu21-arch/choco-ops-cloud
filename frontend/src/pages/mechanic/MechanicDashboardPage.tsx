import { useState } from 'react';
import { useMachineFixes, useSOSAlerts, useLogFix, useUpdateFix } from '../../services/mechanicService';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
  Wrench, 
  Bell,
  CheckCircle, 
  Clock,
  Plus
} from 'lucide-react';
import MaintenanceTickets from './MaintenanceTickets';
import { toast } from 'sonner';

const MechanicDashboardPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showSOSOnly, setShowSOSOnly] = useState(false);
    const [isAddingFix, setIsAddingFix] = useState(false);
    const [newFix, setNewFix] = useState({
        machine_name: '',
        description: '',
        priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    });

    // React Query hooks
    const { data: allFixes = [], isLoading: loadingFixes } = useMachineFixes();
    const { data: sosAlerts = [], isLoading: loadingSOS } = useSOSAlerts();
    const { mutate: logFix, isPending: isLoggingFix } = useLogFix();
    const { mutate: updateFix, isPending: isUpdating } = useUpdateFix();

    const displayFixes = showSOSOnly ? sosAlerts : allFixes;
    const filteredFixes = displayFixes.filter(fix =>
        fix.machine_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fix.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: allFixes.length,
        sos: sosAlerts.length,
        fixed: allFixes.filter(f => f.status === 'FIXED').length,
        pending: allFixes.filter(f => f.status === 'REPORTED' || f.status === 'IN_PROGRESS').length
    };

    const handleAddFix = () => {
        if (!newFix.machine_name || !newFix.description) {
            toast.error('Please fill in all required fields');
            return;
        }

        logFix(
            {
                machine_name: newFix.machine_name,
                description: newFix.description,
                priority: newFix.priority
            },
            {
                onSuccess: () => {
                    setIsAddingFix(false);
                    setNewFix({ machine_name: '', description: '', priority: 'MEDIUM' });
                    toast.success('Issue reported successfully');
                },
            }
        );
    };

    const handleMarkAsFixed = (fixId: string) => {
        const notes = window.prompt('Enter fix notes (optional):');
        updateFix({
            id: fixId,
            updates: {
                status: 'FIXED',
                notes: notes || undefined
            }
        }, {
            onSuccess: () => toast.success('Ticket marked as fixed')
        });
    };

    const handleMarkInProgress = (fixId: string) => {
        updateFix({
            id: fixId,
            updates: {
                status: 'IN_PROGRESS'
            }
        }, {
            onSuccess: () => toast.success('Status updated to In Progress')
        });
    };

    return (
        <div className="space-y-6 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-serif text-cocoa-900">Mechanic Dashboard</h1>
                    <p className="text-muted-foreground">Track machine issues and maintenance logs</p>
                </div>
                <Button 
                    className="gap-2 bg-gold-500 hover:bg-gold-600 text-white shadow-md hover:shadow-lg transition-all"
                    onClick={() => setIsAddingFix(true)}
                >
                    <Plus className="h-4 w-4" /> Report Issue
                </Button>
            </div>

            {/* SOS Alert Banner */}
            {sosAlerts.length > 0 && (
                <Card className="border-red-200 bg-red-50 shadow-md animate-pulse-slow">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Bell className="h-6 w-6 text-red-600" />
                                <span className="absolute -top-1 -start-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-red-900">
                                    {sosAlerts.length} Urgent {sosAlerts.length === 1 ? 'Issue' : 'Issues'} Require Immediate Attention
                                </p>
                                <p className="text-sm text-red-700">High priority machine problems that need fixing now</p>
                            </div>
                            <Button
                                variant={showSOSOnly ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setShowSOSOnly(!showSOSOnly)}
                                className={showSOSOnly ? 'bg-red-600 hover:bg-red-700 text-white shadow-sm' : 'border-red-300 text-red-700 hover:bg-red-100'}
                            >
                                {showSOSOnly ? 'Show All' : 'View SOS'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-cocoa-100 shadow-sm md:col-span-1">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Total Issues</p>
                                <p className="text-2xl font-bold text-cocoa-900">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-cocoa-50 rounded-full">
                                <Wrench className="h-6 w-6 text-cocoa-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-red-100 bg-red-50/20 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-red-700">SOS Alerts</p>
                                <p className="text-2xl font-bold text-red-900">{stats.sos}</p>
                            </div>
                            <div className="p-3 bg-red-100 rounded-full">
                                <Bell className="h-6 w-6 text-red-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-amber-100 bg-amber-50/20 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-amber-700">Pending</p>
                                <p className="text-2xl font-bold text-amber-900">{stats.pending}</p>
                            </div>
                            <div className="p-3 bg-amber-100 rounded-full">
                                <Clock className="h-6 w-6 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-green-100 bg-green-50/20 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-700">Fixed</p>
                                <p className="text-2xl font-bold text-green-900">{stats.fixed}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Add Fix Modal/Form */}
            {isAddingFix && (
                <Card className="border-gold-200 shadow-xl border-2 animate-in fade-in zoom-in duration-300">
                    <CardHeader className="bg-gold-50/50 border-b border-gold-100">
                        <CardTitle className="text-cocoa-900">Report New Machine Issue</CardTitle>
                        <CardDescription>Provide details about the machine problem</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-cocoa-900 mb-1">Machine Name *</label>
                                <Input
                                    placeholder="e.g., Mixer Unit 3"
                                    value={newFix.machine_name}
                                    onChange={(e) => setNewFix({ ...newFix, machine_name: e.target.value })}
                                    className="border-cocoa-200 focus:border-gold-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-cocoa-900 mb-1">Priority *</label>
                                <select
                                    value={newFix.priority}
                                    onChange={(e) => setNewFix({ ...newFix, priority: e.target.value as any })}
                                    className="w-full h-10 px-3 py-2 border border-cocoa-200 rounded-md focus:ring-gold-500 focus:border-gold-500 bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">⚠️ URGENT</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-cocoa-900 mb-1">Description *</label>
                            <textarea
                                placeholder="Describe the issue in detail..."
                                rows={4}
                                value={newFix.description}
                                onChange={(e) => setNewFix({ ...newFix, description: e.target.value })}
                                className="w-full px-3 py-2 border border-cocoa-200 rounded-md focus:ring-gold-500 focus:border-gold-500 text-sm"
                            />
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsAddingFix(false)}
                                className="border-cocoa-200"
                                disabled={isLoggingFix}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAddFix}
                                className="bg-gold-500 hover:bg-gold-600 text-white"
                                disabled={isLoggingFix}
                            >
                                {isLoggingFix ? 'Logging...' : 'Log Issue'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Issues List Component */}
            <MaintenanceTickets 
                tickets={filteredFixes}
                isLoading={loadingFixes || loadingSOS}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onMarkFixed={handleMarkAsFixed}
                onStartWork={handleMarkInProgress}
                isUpdating={isUpdating}
                showSOSOnly={showSOSOnly}
            />
        </div>
    );
};

export default MechanicDashboardPage;
