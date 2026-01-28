import { useEffect, useState } from 'react';
import { qcService } from '../../services/qcService';
import { Batch } from '../../types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ClipboardCheck, Check, X } from 'lucide-react';

const QCPage = () => {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState<{[key: string]: string}>({});

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const data = await qcService.getPendingBatches();
                setBatches(data);
            } catch (error) {
                console.error('Failed to load pending batches:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBatches();
    }, []);

    const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            await qcService.updateQualityStatus(id, {
                batch_id: id,
                status,
                notes: notes[id] || ''
            });
            // Optimistic update
            setBatches(prev => prev.filter(b => b.id !== id));
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Quality Control</h1>
            <p className="text-muted-foreground">Verify production batches before release.</p>

            {loading ? (
                <div className="text-center py-10 text-muted-foreground">Loading...</div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {batches.length === 0 ? (
                        <div className="col-span-full text-center py-10 text-muted-foreground">
                            No batches pending Quality Control.
                        </div>
                    ) : batches.map(batch => (
                        <Card key={batch.id} className="border-yellow-200 bg-yellow-50/20">
                             <CardHeader className="pb-2">
                                 <div className="flex items-center gap-2 text-yellow-800">
                                     <ClipboardCheck className="h-5 w-5" />
                                     <CardTitle className="text-lg">Batch #{batch.batch_number || batch.id}</CardTitle>
                                 </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="text-2xl font-bold">{batch.recipe_name || 'Unknown Recipe'}</div>
                                    <div className="text-sm text-slate-600">{batch.quantity_produced} Units</div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">QC Notes</label>
                                    <Input 
                                        placeholder="Enter findings..." 
                                        value={notes[batch.id] || ''}
                                        onChange={(e) => setNotes({...notes, [batch.id]: e.target.value})}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="gap-2">
                                <Button 
                                    className="w-full bg-red-100 text-red-700 hover:bg-red-200" 
                                    variant="ghost"
                                    onClick={() => handleAction(batch.id, 'REJECTED')}
                                >
                                    <X className="h-4 w-4 mr-2" /> Reject
                                </Button>
                                <Button 
                                    className="w-full bg-green-600 hover:bg-green-700"
                                    onClick={() => handleAction(batch.id, 'APPROVED')}
                                >
                                    <Check className="h-4 w-4 mr-2" /> Approve
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QCPage;
