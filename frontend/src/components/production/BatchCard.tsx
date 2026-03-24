import React from 'react';
import { cn } from '../../lib/utils';
import { Batch, BatchStatus } from '../../types';
import { differenceInMinutes, format } from 'date-fns';
import { Clock, Play, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useProduction } from '../../hooks/useProduction';
import { toast } from 'sonner';

interface BatchCardProps {
  batch: Batch;
}

const BatchCard: React.FC<BatchCardProps> = ({ batch }) => {
  const { useUpdateBatchStatus } = useProduction();
  const updateStatusMutation = useUpdateBatchStatus();

  const handleStatusUpdate = async (newStatus: 'completed' | 'failed' | 'in_progress') => {
    try {
      await updateStatusMutation.mutateAsync({ id: batch.id, status: newStatus as BatchStatus });
      toast.success(`Batch marked as ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const duration = batch.started_at 
    ? differenceInMinutes(new Date(), new Date(batch.started_at))
    : 0;

  return (
    <Card className={cn(
      "border-l-4 hover:shadow-lg transition-all duration-300 group overflow-hidden relative",
      batch.status === 'in_progress' ? 'border-l-blue-500 shadow-blue-100/50' :
      batch.status === 'completed' ? 'border-l-emerald-500 shadow-emerald-100/50' :
      batch.status === 'failed' ? 'border-l-red-500 shadow-red-100/50' :
      'border-l-slate-300 shadow-slate-100/50'
    )}>
      {/* Background Texture */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/0 to-gray-50/50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-black uppercase tracking-wider text-chocolate-400/60">
              #{batch.batch_number ?? batch.id.slice(0, 8)}
            </span>
            <Badge variant={
              batch.status === 'completed' ? 'success' :
              batch.status === 'failed' ? 'error' :
              batch.status === 'in_progress' ? 'info' : 'default'
            } className="shadow-sm">
              {batch.status.replace('_', ' ')}
            </Badge>
          </div>
          <h3 className="font-bold text-chocolate-900 line-clamp-1 text-lg group-hover:text-chocolate-700 transition-colors">
            {batch.recipe_name}
          </h3>
          {batch.operator_name && (
            <div className="mt-1 flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-chocolate-100 flex items-center justify-center text-[10px] font-bold text-chocolate-600 border border-chocolate-200">
                {batch.operator_name.charAt(0)}
              </div>
              <span className="text-[11px] font-bold text-chocolate-500">{batch.operator_name}</span>
              <span className="text-[10px] bg-gold-100 text-gold-700 px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter">{batch.classification || 'Operator'}</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-3 text-sm">
        <div className="flex justify-between mb-2">
          <span className="text-gray-500">Target:</span>
          <span className="font-medium text-gray-900">{batch.target_quantity} units</span>
        </div>
        
        {batch.started_at && (
           <div className="flex justify-between mb-2">
            <span className="text-gray-500">Started:</span>
            <span className="font-medium text-gray-900 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {format(new Date(batch.started_at), 'MMM d, HH:mm')}
            </span>
          </div>
        )}

        {batch.status === 'in_progress' && (
           <div className="flex justify-between items-center bg-blue-50/50 p-2 rounded-lg border border-blue-100">
            <span className="text-blue-600/70 text-xs font-semibold uppercase tracking-wider">Run Time</span>
            <span className="font-mono font-bold text-blue-700">{duration}m</span>
          </div>
        )}

        {batch.status === 'failed' && batch.failure_reason && (
          <div className="mt-3 bg-red-50 p-2.5 rounded-xl border border-red-100 flex gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <div className="space-y-1">
              <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Failure Diagnosis</p>
              <p className="text-[11px] font-bold text-red-800 leading-tight">{batch.failure_reason}</p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t border-gray-100 flex justify-end gap-2">
        {batch.status === 'pending' && (
          <Button 
            size="sm" 
            onClick={() => { void handleStatusUpdate('in_progress'); }}
            isLoading={updateStatusMutation.isPending}
            disabled={updateStatusMutation.isPending}
          >
            <Play className="w-3 h-3 mr-1" /> Start
          </Button>
        )}
        
        {batch.status === 'in_progress' && (
          <>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-red-600 hover:bg-red-50" 
              onClick={() => { void handleStatusUpdate('failed'); }}
              isLoading={updateStatusMutation.isPending}
              disabled={updateStatusMutation.isPending}
            >
              <AlertTriangle className="w-3 h-3 mr-1" /> Fail
            </Button>
            <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-700" 
              onClick={() => { void handleStatusUpdate('completed'); }}
              isLoading={updateStatusMutation.isPending}
              disabled={updateStatusMutation.isPending}
            >
              <CheckCircle className="w-3 h-3 mr-1" /> Complete
            </Button>
          </>
        )}
        
        {(batch.status === 'completed' || batch.status === 'failed') && (
           <span className="text-xs text-gray-400 italic">
             Ended {batch.completed_at ? format(new Date(batch.completed_at), 'MMM d, HH:mm') : '-'}
           </span>
        )}
      </CardFooter>
    </Card>
  );
};

export default BatchCard;
