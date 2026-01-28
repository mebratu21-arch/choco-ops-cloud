import { useState } from 'react';
import { useQualityChecks, useUpdateQualityCheck } from '../../services/qcService';
import { QualityControl } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  TrendingUp,
  TrendingDown,
  Plus
} from 'lucide-react';
import QualityChecks from './QualityChecks';
import { toast } from 'sonner';

type QCView = 'pending' | 'approved' | 'rejected' | 'all';

const QCDashboard = () => {
    const [view, setView] = useState<QCView>('pending');
    const [searchTerm, setSearchTerm] = useState('');

    // React Query hooks
    const { data: allChecks = [], isLoading } = useQualityChecks();
    const { mutate: updateCheck, isPending: isUpdating } = useUpdateQualityCheck();

    // Stats calculation
    const stats = {
        total: allChecks.length,
        pending: allChecks.filter(c => c.status === 'PENDING').length,
        approved: allChecks.filter(c => c.status === 'APPROVED').length,
        rejected: allChecks.filter(c => c.status === 'REJECTED').length,
        approvalRate: allChecks.length > 0 
            ? ((allChecks.filter(c => c.status === 'APPROVED').length / allChecks.length) * 100).toFixed(1)
            : '0.0'
    };

    const getFilteredChecks = (): QualityControl[] => {
        let filtered = allChecks;

        if (view !== 'all') {
            filtered = filtered.filter(check => {
                if (view === 'pending') return check.status === 'PENDING';
                if (view === 'approved') return check.status === 'APPROVED';
                if (view === 'rejected') return check.status === 'REJECTED';
                return true;
            });
        }

        if (searchTerm) {
            filtered = filtered.filter(check =>
                check.batch_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                check.notes?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    };

    const handleApprove = (checkId: string) => {
        // Find the check to get its batch_id
        const check = allChecks.find(c => c.id === checkId);
        if (!check) return;

        updateCheck({
            id: checkId,
            update: { 
                status: 'APPROVED', 
                defect_count: 0,
                batch_id: check.batch_id // Required field
            }
        });
    };

    const handleReject = (checkId: string) => {
        const check = allChecks.find(c => c.id === checkId);
        if (!check) return;

        // Simple prompt for now, could be a modal
        const defectCountStr = window.prompt("Enter number of defects found:", "1");
        if (defectCountStr === null) return;
        
        const reason = window.prompt("Enter rejection reason/notes:");
        if (reason === null) return;

        updateCheck({
            id: checkId,
            update: { 
                status: 'REJECTED', 
                defect_count: parseInt(defectCountStr) || 1,
                notes: reason,
                batch_id: check.batch_id // Required field
            }
        }, {
            onSuccess: () => toast.success("Batch rejected successfully")
        });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-serif text-white">Quality Assurance</h1>
                    <p className="text-slate-400">Ensure every batch meets the Artisan Standard</p>
                </div>
                <Button className="gap-2 bg-gold-600 hover:bg-gold-700 text-black font-semibold">
                    <Plus className="h-4 w-4" /> New Inspection
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Pending Review</p>
                                <p className="text-3xl font-bold text-white mt-1">{stats.pending}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-amber-900/30 text-amber-500">
                                <AlertCircle className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Approved Today</p>
                                <p className="text-3xl font-bold text-white mt-1">{stats.approved}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-green-900/30 text-green-500">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Rejections</p>
                                <p className="text-3xl font-bold text-white mt-1">{stats.rejected}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-red-900/30 text-red-500">
                                <XCircle className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Quality Score</p>
                                <p className="text-3xl font-bold text-gold-500 mt-1">{stats.approvalRate}%</p>
                            </div>
                            <div className="p-3 rounded-lg bg-gold-900/20 text-gold-500">
                                {Number(stats.approvalRate) >= 95 ? (
                                    <TrendingUp className="h-6 w-6" />
                                ) : (
                                    <TrendingDown className="h-6 w-6" />
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-1">
                <Button
                    variant={view === 'pending' ? 'default' : 'ghost'}
                    onClick={() => setView('pending')}
                    className={view === 'pending' 
                        ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                        : 'text-slate-400 hover:text-amber-500 hover:bg-slate-800'}
                >
                    Needs Action
                </Button>
                <Button
                    variant={view === 'approved' ? 'default' : 'ghost'}
                    onClick={() => setView('approved')}
                    className={view === 'approved' 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'text-slate-400 hover:text-green-500 hover:bg-slate-800'}
                >
                    Approved
                </Button>
                <Button
                    variant={view === 'rejected' ? 'default' : 'ghost'}
                    onClick={() => setView('rejected')}
                    className={view === 'rejected' 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'text-slate-400 hover:text-red-500 hover:bg-slate-800'}
                >
                    Rejected
                </Button>
                <Button
                    variant={view === 'all' ? 'default' : 'ghost'}
                    onClick={() => setView('all')}
                    className={view === 'all' 
                        ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'}
                >
                    All History
                </Button>
            </div>

            {/* Data List */}
            <QualityChecks 
                checks={getFilteredChecks()} 
                isLoading={isLoading}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onApprove={handleApprove}
                onReject={handleReject}
                isUpdating={isUpdating}
            />
        </div>
    );
};

export default QCDashboard;
