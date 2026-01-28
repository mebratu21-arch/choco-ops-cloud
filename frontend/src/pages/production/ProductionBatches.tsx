import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

// Mock data for display
const mockBatches = [
    { id: 'BATCH-1001', recipe: 'Dark Choco 70%', status: 'COOKING', start_time: '2025-01-20T08:00:00', staff: 'Alice Worker' },
    { id: 'BATCH-1002', recipe: 'Milk Choco Hazelnut', status: 'QC_PENDING', start_time: '2025-01-20T09:30:00', staff: 'Bob Baker' },
    { id: 'BATCH-1003', recipe: 'White Choco Bar', status: 'COMPLETED', start_time: '2025-01-19T14:00:00', staff: 'Alice Worker' },
    { id: 'BATCH-1004', recipe: 'Dark Choco 85%', status: 'DELAYED', start_time: '2025-01-20T10:00:00', staff: 'Charlie Chef' },
];

const ProductionBatches = () => {
    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
                <CardTitle className="text-white">Batch Execution Log</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-950/50">
                            <tr>
                                <th className="px-6 py-3">Batch ID</th>
                                <th className="px-6 py-3">Recipe</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Start Time</th>
                                <th className="px-6 py-3">Staff</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockBatches.map((batch) => (
                                <tr key={batch.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-mono text-gold-500">{batch.id}</td>
                                    <td className="px-6 py-4 font-medium text-white">{batch.recipe}</td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border
                                            ${batch.status === 'COOKING' ? 'bg-blue-900/30 text-blue-400 border-blue-900' :
                                              batch.status === 'QC_PENDING' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-900' :
                                              batch.status === 'COMPLETED' ? 'bg-green-900/30 text-green-400 border-green-900' :
                                              'bg-red-900/30 text-red-400 border-red-900'}`}>
                                            {batch.status === 'COOKING' && <Loader2 className="h-3 w-3 animate-spin" />}
                                            {batch.status === 'QC_PENDING' && <Clock className="h-3 w-3" />}
                                            {batch.status === 'COMPLETED' && <CheckCircle2 className="h-3 w-3" />}
                                            {batch.status === 'DELAYED' && <AlertCircle className="h-3 w-3" />}
                                            {batch.status}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">
                                        {new Date(batch.start_time).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">{batch.staff}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProductionBatches;
