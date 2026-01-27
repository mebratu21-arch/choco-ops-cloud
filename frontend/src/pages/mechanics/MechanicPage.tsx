import React, { useEffect, useState } from 'react';
import { mechanicService } from '../../services/mechanicService';
import { MachineLog } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Wrench, CheckCircle2 } from 'lucide-react';
import { Input } from '../../components/ui/Input';

const MechanicPage = () => {
    const [logs, setLogs] = useState<MachineLog[]>([]);
    const [itemsLoading, setItemsLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            const data = await mechanicService.getLogs();
            setLogs(data);
            setItemsLoading(false);
        };
        fetchLogs();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Mechanic Maintenance Logs</h1>

             <Card className="bg-slate-50 border-slate-200">
                <CardHeader>
                    <CardTitle className="text-lg">Report New Issue</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <Input placeholder="Machine ID (e.g. M-101)" className="w-40" />
                        <Input placeholder="Describe the issue..." className="flex-1" />
                        <Button className="bg-red-600 hover:bg-red-700">Report</Button>
                    </div>
                </CardContent>
            </Card>
            
            <div className="grid gap-4">
                {itemsLoading ? <p>Loading...</p> : logs.map(log => (
                    <Card key={log.id} className={log.status === 'OPEN' ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-green-500'}>
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-full ${log.status === 'OPEN' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                    <Wrench className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{log.machineId}</h3>
                                    <p className="text-slate-600">{log.issue}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Reported: {new Date(log.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                            <div>
                                {log.status === 'OPEN' ? (
                                    <Button>Mark as Fixed</Button>
                                ) : (
                                    <span className="flex items-center gap-1 text-green-600 font-medium">
                                        <CheckCircle2 className="h-4 w-4" /> Resolved
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default MechanicPage;
