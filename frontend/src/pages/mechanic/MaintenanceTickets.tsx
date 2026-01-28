import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Wrench, CheckCircle, Clock, Settings, Search, AlertTriangle } from 'lucide-react';
import { MachineFix } from '../../types';

interface MaintenanceTicketsProps {
    tickets: MachineFix[];
    isLoading: boolean;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onMarkFixed: (id: string) => void;
    onStartWork: (id: string) => void;
    isUpdating: boolean;
    showSOSOnly: boolean;
}

const MaintenanceTickets: React.FC<MaintenanceTicketsProps> = ({
    tickets,
    isLoading,
    searchTerm,
    onSearchChange,
    onMarkFixed,
    onStartWork,
    isUpdating,
    showSOSOnly
}) => {

    const getPriorityConfig = (priority: string) => {
        switch (priority) {
            case 'URGENT':
                return { label: 'URGENT', color: 'bg-red-100 text-red-700 border-red-200', pulse: true };
            case 'HIGH':
                return { label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-200', pulse: false };
            case 'MEDIUM':
                return { label: 'Medium', color: 'bg-amber-100 text-amber-700 border-amber-200', pulse: false };
            case 'LOW':
            default:
                return { label: 'Low', color: 'bg-slate-100 text-slate-700 border-slate-200', pulse: false };
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'FIXED':
                return { label: 'Fixed', color: 'text-green-600 bg-green-50 border-green-200', icon: CheckCircle };
            case 'IN_PROGRESS':
                return { label: 'In Progress', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Settings };
            case 'REPORTED':
            default:
                return { label: 'Reported', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock };
        }
    };

    return (
        <Card className="border-cocoa-100 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-cocoa-900 flex items-center gap-2">
                            {showSOSOnly && <AlertTriangle className="h-5 w-5 text-red-500" />}
                            {showSOSOnly ? 'SOS Alerts' : 'Maintenance Tickets'}
                        </CardTitle>
                        <CardDescription>
                            {tickets.length} {showSOSOnly ? 'urgent' : ''} issue{tickets.length !== 1 ? 's' : ''} found
                        </CardDescription>
                    </div>
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search tickets..."
                            className="ps-8 w-full md:w-64 border-cocoa-200 focus:border-gold-500"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                {isLoading ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <div className="animate-spin h-8 w-8 border-2 border-gold-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        Loading tickets...
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                        <Wrench className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-muted-foreground">
                            {showSOSOnly ? 'No urgent issues pending' : 'No maintenance tickets found'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tickets.map(fix => {
                            const priorityConfig = getPriorityConfig(fix.priority);
                            const statusConfig = getStatusConfig(fix.status);
                            const StatusIcon = statusConfig.icon;

                            return (
                                <div 
                                    key={fix.id} 
                                    className={`border rounded-lg p-4 transition-all hover:shadow-md ${priorityConfig.color} ${priorityConfig.pulse ? 'animate-pulse-slow ring-1 ring-red-300' : ''}`}
                                >
                                    <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className={`p-2 rounded-lg bg-white/50 backdrop-blur-sm shadow-sm`}>
                                                <Wrench className="h-5 w-5 text-cocoa-800" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <h3 className="font-bold text-lg text-cocoa-900">
                                                        {fix.machine_name || 'Unknown Machine'}
                                                    </h3>
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-white/80 border ${priorityConfig.color.split(' ')[2] || 'border-gray-200'} text-gray-800 shadow-sm`}>
                                                        {priorityConfig.label}
                                                    </span>
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border ${statusConfig.color}`}>
                                                        <StatusIcon className="h-3 w-3 me-1" />
                                                        {statusConfig.label}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-800 font-medium mb-2">{fix.description}</p>
                                                {fix.notes && (
                                                    <div className="bg-white/40 p-2 rounded-md mb-2 border border-black/5">
                                                        <p className="text-xs text-slate-600 italic">
                                                            <span className="font-semibold not-italic">Tech Notes:</span> {fix.notes}
                                                        </p>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        Reported: {new Date(fix.created_at).toLocaleString()}
                                                    </span>
                                                    {fix.fixed_at && (
                                                        <span className="text-green-700 font-bold flex items-center gap-1">
                                                            <CheckCircle className="h-3 w-3" />
                                                            Fixed: {new Date(fix.fixed_at).toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {fix.status !== 'FIXED' && (
                                            <div className="flex gap-2 w-full md:w-auto">
                                                {fix.status === 'REPORTED' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex-1 md:flex-none border-blue-200 text-blue-700 hover:bg-blue-50 bg-white"
                                                        onClick={() => onStartWork(fix.id)}
                                                        disabled={isUpdating}
                                                    >
                                                        <Settings className="h-4 w-4 me-1" />
                                                        Start Work
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1 md:flex-none border-green-200 text-green-700 hover:bg-green-50 bg-white"
                                                    onClick={() => onMarkFixed(fix.id)}
                                                    disabled={isUpdating}
                                                >
                                                    <CheckCircle className="h-4 w-4 me-1" />
                                                    Mark Fixed
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

export default MaintenanceTickets;
