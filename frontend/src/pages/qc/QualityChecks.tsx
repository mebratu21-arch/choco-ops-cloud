import React from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Search
} from 'lucide-react';
import { QualityControl } from '../../types';

interface QualityChecksProps {
    checks: QualityControl[];
    isLoading: boolean;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    isUpdating: boolean;
}

const QualityChecks: React.FC<QualityChecksProps> = ({
    checks,
    isLoading,
    searchTerm,
    onSearchChange,
    onApprove,
    onReject,
    isUpdating
}) => {
    
    // Helper for status config
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return {
                    label: 'Approved',
                    color: 'bg-green-50 border-green-200 text-green-700',
                    icon: CheckCircle2,
                    iconColor: 'text-green-600'
                };
            case 'REJECTED':
                return {
                    label: 'Rejected',
                    color: 'bg-red-50 border-red-200 text-red-700',
                    icon: XCircle,
                    iconColor: 'text-red-600'
                };
            case 'PENDING':
            default:
                return {
                    label: 'Pending',
                    color: 'bg-amber-50 border-amber-200 text-amber-700',
                    icon: AlertCircle,
                    iconColor: 'text-amber-600'
                };
        }
    };

    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                     <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <ClipboardCheck className="h-5 w-5 text-gold-500" />
                        Inspection Log
                    </h3>
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Search batch ID or notes..."
                            className="ps-8 bg-slate-950 border-slate-800 text-slate-200 focus:border-gold-500 placeholder:text-slate-600"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                {isLoading ? (
                    <div className="text-center py-12 text-slate-500">
                        <div className="animate-spin h-8 w-8 border-2 border-gold-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        Loading quality checks...
                    </div>
                ) : checks.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-lg">
                        <ClipboardCheck className="h-12 w-12 text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-500">No quality checks found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {checks.map(check => {
                            const statusConfig = getStatusConfig(check.status);
                            const StatusIcon = statusConfig.icon;

                            return (
                                <div key={check.id} className={`border rounded-lg p-4 transition-all hover:bg-slate-800/30 ${statusConfig.color.replace('bg-', 'hover:bg-opacity-10 border-')}`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-xl bg-white/5`}>
                                                <StatusIcon className={`h-6 w-6 ${statusConfig.iconColor}`} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-gold-500 font-bold">
                                                        {check.batch_id}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border ${statusConfig.color}`}>
                                                        {statusConfig.label}
                                                    </span>
                                                </div>
                                                
                                                {check.notes && (
                                                    <p className="text-sm text-slate-400 mb-2 italic">"{check.notes}"</p>
                                                )}
                                                
                                                <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                                                    <span>User: {check.checked_by.slice(0,8)}</span>
                                                    <span>•</span>
                                                    <span>{new Date(check.created_at).toLocaleString()}</span>
                                                    {check.defect_count > 0 && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-red-400 font-bold flex items-center gap-1">
                                                                <AlertCircle className="h-3 w-3" />
                                                                {check.defect_count} Defects
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {check.status === 'PENDING' && (
                                            <div className="flex flex-col gap-2">
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700 text-white border-none w-24"
                                                    onClick={() => onApprove(check.id)}
                                                    disabled={isUpdating}
                                                >
                                                    <CheckCircle2 className="h-4 w-4 me-1" />
                                                    Pass
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-400 hover:text-red-300 hover:bg-red-950/30 w-24"
                                                    onClick={() => onReject(check.id)}
                                                    disabled={isUpdating}
                                                >
                                                    <XCircle className="h-4 w-4 me-1" />
                                                    Reject
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default QualityChecks;
