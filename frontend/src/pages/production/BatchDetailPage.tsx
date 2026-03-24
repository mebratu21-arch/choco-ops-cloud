import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProduction } from '../../hooks/useProduction';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Clock,
  FlaskConical,
  Flame,
  ThermometerSnowflake,
  Box,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { BatchStatus } from '../../types';

const BatchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { useBatch, useUpdateBatchStatus } = useProduction();
  
  const { data: batch, isLoading } = useBatch(id!);
  const updateStatusMutation = useUpdateBatchStatus();

  const handleStatusUpdate = async (newStatus: BatchStatus) => {
    if (!batch) return;
    try {
      await updateStatusMutation.mutateAsync({ id: batch.id, status: newStatus });
      toast.success(`Batch updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update batch status.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-bold text-chocolate-900">Batch not found</h3>
        <Link to="/batches" className="text-chocolate-600 hover:text-chocolate-800 mt-2 inline-block font-medium">Back to list</Link>
      </div>
    );
  }

  const steps = [
    { status: 'pending', label: 'Draft', icon: Clock },
    { status: 'mixing', label: 'Mixing', icon: FlaskConical },
    { status: 'cooking', label: 'Cooking', icon: Flame },
    { status: 'cooling', label: 'Cooling', icon: ThermometerSnowflake },
    { status: 'packaging', label: 'Packaging', icon: Box },
    { status: 'completed', label: 'Completed', icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex(s => s.status === batch.status);

  return (
    <div className="space-y-6 pb-20">
      <Link to="/batches" className="flex items-center gap-1 text-sm text-chocolate-600 hover:text-chocolate-900 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Batches
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress & Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-chocolate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-chocolate-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="flex justify-between items-center mb-10 relative z-10">
              <div>
                <h1 className="text-3xl font-black text-chocolate-900 tracking-tight">Batch #{batch.batchNumber}</h1>
                <p className="text-sm font-medium text-chocolate-600 mt-1">{batch.recipeName ?? 'Premium Recipe'}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-chocolate-400 uppercase tracking-[0.2em] font-black">Planned Quantity</p>
                <div className="flex items-baseline justify-end gap-1">
                  <p className="text-3xl font-black text-chocolate-900">{batch.targetQuantity}</p>
                  <span className="text-xs font-bold text-chocolate-400 uppercase">UNITS</span>
                </div>
              </div>
            </div>

            {/* Stepper Progress */}
            <div className="relative mb-12">
              <div className="absolute top-5 left-0 right-0 h-1 bg-chocolate-50 rounded-full" />
              <div 
                className="absolute top-5 left-0 h-1 bg-gradient-to-r from-chocolate-500 to-gold-500 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_#cf9a3c]" 
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              />
              
              <div className="relative flex justify-between">
                {steps.slice(0, 6).map((step, idx) => {
                  const Icon = step.icon;
                  const isActive = idx === currentStepIndex;
                  const isCompleted = idx < currentStepIndex;
                  
                  return (
                    <div key={idx} className="flex flex-col items-center group cursor-default">
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center z-10 border-2 transition-all duration-300 ${
                          isActive 
                            ? 'bg-chocolate-900 border-chocolate-900 text-gold-500 shadow-lg shadow-chocolate-900/30 scale-125' 
                            : isCompleted 
                              ? 'bg-chocolate-500 border-chocolate-500 text-white' 
                              : 'bg-white border-chocolate-100 text-chocolate-200'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                      </div>
                      <span className={`mt-4 text-[10px] font-black uppercase tracking-widest transition-colors ${
                        isActive ? 'text-chocolate-900 translate-y-0 opacity-100' : 'text-chocolate-300'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Area */}
            <div className="p-8 bg-chocolate-50/50 rounded-3xl border border-chocolate-100/50 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
               <h3 className="text-sm font-black text-chocolate-950 mb-6 uppercase tracking-widest relative z-10">Production Gateway</h3>
               
               {batch.status === 'completed' || batch.status === 'failed' ? (
                 <div className="text-center py-6 relative z-10">
                    <CheckCircle2 className={`w-16 h-16 mx-auto mb-4 ${batch.status === 'completed' ? 'text-emerald-500' : 'text-red-500'}`} />
                    <h4 className="text-2xl font-black capitalize text-chocolate-900">Batch {batch.status}</h4>
                    <p className="text-chocolate-500 mt-2 font-medium">Workflow cycle finalized.</p>
                 </div>
               ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                  {currentStepIndex < steps.length - 1 && (
                    <button 
                      onClick={() => handleStatusUpdate(steps[currentStepIndex + 1].status as BatchStatus)}
                      className="flex items-center justify-center gap-2 bg-chocolate-900 text-gold-500 py-4 rounded-xl font-black hover:bg-chocolate-800 transition-all shadow-lg shadow-chocolate-900/10 active:scale-[0.98] uppercase tracking-wide text-sm"
                    >
                      <Play className="w-4 h-4" />
                      Start {steps[currentStepIndex + 1].label}
                    </button>
                  )}
                  
                  <button 
                    onClick={() => handleStatusUpdate('completed')}
                    className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98] uppercase tracking-wide text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Quick Complete
                  </button>
                  
                  <button 
                    onClick={() => handleStatusUpdate('failed')}
                    className="flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 py-4 rounded-xl font-bold hover:bg-red-50 transition-all sm:col-span-2 uppercase tracking-wide text-sm hover:border-red-300"
                  >
                    <XCircle className="w-4 h-4" />
                    Abort & Quarantine
                  </button>
                </div>
               )}
            </div>
          </div>
        </div>

        {/* Info & Logs Column */}
        <div className="space-y-6">
           <div className="bg-white p-8 rounded-[2rem] border border-chocolate-100 shadow-sm">
             <h4 className="text-xs font-black text-chocolate-950 mb-6 uppercase tracking-[0.2em] border-b border-chocolate-50 pb-4">Specifications</h4>
             <dl className="space-y-5">
               <div>
                  <dt className="text-[10px] uppercase tracking-wider font-bold text-chocolate-400">Standard Operator</dt>
                  <dd className="text-sm font-bold text-chocolate-900 mt-1">Automatic Allocation</dd>
               </div>
               <div>
                  <dt className="text-[10px] uppercase tracking-wider font-bold text-chocolate-400">Assigned Production Line</dt>
                  <dd className="text-sm font-bold text-chocolate-900 mt-1">Central Processor #1</dd>
               </div>
               <div>
                  <dt className="text-[10px] uppercase tracking-wider font-bold text-chocolate-400">Batch Notes</dt>
                  <dd className="text-sm italic text-chocolate-700 mt-1 bg-chocolate-50 p-3 rounded-xl">"{batch.notes ?? 'No notes available'}"</dd>
               </div>
             </dl>
           </div>
           
           <div className="bg-white p-8 rounded-[2rem] border border-chocolate-100 shadow-sm">
             <h4 className="text-xs font-black text-chocolate-950 mb-6 uppercase tracking-[0.2em]">Quality Assurance</h4>
             <div className="p-6 bg-chocolate-50/50 rounded-2xl border border-dashed border-chocolate-200 text-center">
                <ShieldCheck className="w-8 h-8 text-gold-500 mx-auto mb-3" />
                <p className="text-xs text-chocolate-600 font-medium leading-relaxed mb-4">
                  QC inspections trigger automatically. Protocol V4.2 requires double-sampling.
                </p>
                <button className="text-chocolate-900 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:text-gold-600 transition-colors mx-auto group">
                   Run Prevention Check <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default BatchDetailPage;
