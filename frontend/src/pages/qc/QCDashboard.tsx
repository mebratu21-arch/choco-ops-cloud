import React, { useEffect } from 'react';
import { ClipboardCheck, AlertCircle, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import QCInspectionForm from '../../components/qc/QCInspectionForm';
import QCStatsCards from '../../components/qc/QCStatsCards';
import QCHistoryTable from '../../components/qc/QCHistoryTable';
import QCChartsSection from '../../components/qc/QCChartsSection';
import { useQC } from '../../hooks/useQC';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const QCDashboard: React.FC = () => {
    const { useQCChecks, useQCStats, useDefectAnalysis } = useQC();
    
    const {
      data: qcChecksData,
      isLoading: loadingChecks,
      refetch: refetchChecks,
    } = useQCChecks({});
  
    const {
      data: stats,
      refetch: refetchStats,
    } = useQCStats();

    const {
      data: defectAnalysis,
      refetch: refetchDefects,
    } = useDefectAnalysis();
  
    useEffect(() => {
      const interval = setInterval(() => {
        void refetchChecks();
        void refetchStats();
        void refetchDefects();
      }, 60000);
  
      return () => clearInterval(interval);
    }, [refetchChecks, refetchStats, refetchDefects]);
  
    const handleFormSuccess = () => {
      void refetchChecks();
      void refetchStats();
      void refetchDefects();
    };
  
    return (
      <motion.div 
        className="min-h-screen bg-cyan-50 space-y-8 pb-20 px-4 pt-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-cyan-200 pb-8">
            <div className="space-y-1">
              <motion.h1 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-4xl font-black text-cyan-900 tracking-tight uppercase"
              >
                Quality <span className="text-cyan-600">Assurance Dashboard</span>
              </motion.h1>
              <p className="text-cyan-700/60 font-bold uppercase tracking-widest text-[11px]">Final Year Project • Excellence in Manufacturing</p>
            </div>
            
            <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border-2 border-cyan-100 shadow-sm">
              <div className="flex items-center gap-3 text-[10px] font-black text-cyan-800 tracking-widest uppercase">
                <ShieldCheck className="w-4 h-4 text-cyan-500" />
                Security Verified
              </div>
              <div className="h-6 w-[1.5px] bg-cyan-100" />
              <div className="flex items-center gap-3 text-[10px] font-black text-green-600 tracking-widest uppercase">
                 <span className="w-2 h-2 rounded-full bg-green-500" />
                 System Operational
              </div>
            </div>
          </div>
    
          {/* Main Content Rows */}
          <div className="space-y-10">
             
             {/* Row 1: Key Performance Indicators */}
             <motion.div variants={itemVariants} className="w-full">
               {stats && <QCStatsCards stats={stats} />}
             </motion.div>

             {/* Row 2: Inspection Entry & Hazard Matrix */}
             <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <motion.div variants={itemVariants} className="xl:col-span-2">
                   <Card className="shadow-lg border-2 border-cyan-100 bg-white text-black overflow-hidden rounded-[2rem]">
                     <CardContent className="p-10">
                       <div className="flex items-center gap-6 mb-10 border-b border-cyan-50 pb-6">
                         <div className="p-4 bg-cyan-50 rounded-2xl border border-cyan-100">
                           <ClipboardCheck className="w-8 h-8 text-cyan-600" />
                         </div>
                         <div>
                           <h2 className="text-2xl font-black tracking-tight uppercase text-cyan-900">Sensory Inspection Protocol</h2>
                           <p className="text-cyan-600/60 text-[10px] font-bold uppercase tracking-wider">Quality Control Entry Module</p>
                         </div>
                       </div>
                       <QCInspectionForm onSuccess={handleFormSuccess} />
                     </CardContent>
                   </Card>
                </motion.div>

                <motion.div variants={itemVariants} className="xl:col-span-1">
                   <div className="bg-white p-10 rounded-[2rem] border-2 border-cyan-100 shadow-lg h-full flex flex-col">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-black text-cyan-900 uppercase tracking-tighter flex items-center gap-3">
                          <AlertCircle className="w-6 h-6 text-red-500" />
                          Critical Alerts
                        </h3>
                        <span className="px-3 py-1 bg-red-50 text-red-600 text-[9px] font-black rounded-lg border border-red-100 uppercase tracking-widest">Active</span>
                      </div>
                      <div className="space-y-4 flex-1">
                         <div className="p-6 bg-cyan-50/50 rounded-2xl border border-cyan-100 flex gap-4 hover:border-cyan-300 transition-colors cursor-default">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center font-black text-xl">!</div>
                            <div>
                               <p className="font-black text-cyan-950 uppercase text-xs tracking-tight">Material Anomaly</p>
                               <p className="text-[9px] text-cyan-700/60 font-bold uppercase tracking-wider">Production Line 4</p>
                            </div>
                         </div>
                         <div className="p-6 bg-cyan-50/50 rounded-2xl border border-cyan-100 flex gap-4 hover:border-cyan-300 transition-colors cursor-default">
                            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-black text-xl">?</div>
                            <div>
                               <p className="font-black text-cyan-950 uppercase text-xs tracking-tight">Viscosity Alert</p>
                               <p className="text-[9px] text-cyan-700/60 font-bold uppercase tracking-wider">Mixing Tank B</p>
                            </div>
                         </div>
                      </div>
                      <div className="mt-12 pt-8 border-t border-cyan-50">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-black text-cyan-700/40 uppercase tracking-widest">Resource Usage</span>
                          <span className="text-2xl font-black text-cyan-900">88%</span>
                        </div>
                        <div className="h-3 bg-cyan-50 rounded-full overflow-hidden border border-cyan-100">
                          <motion.div 
                            className="h-full bg-cyan-500"
                            initial={{ width: 0 }}
                            animate={{ width: '88%' }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                   </div>
                </motion.div>
             </div>

             {/* Row 3: Analytics & Trends */}
             <motion.div variants={itemVariants} className="w-full">
                {stats && defectAnalysis && (
                  <div className="bg-white rounded-[2rem] border-2 border-cyan-100 p-10 shadow-lg">
                    <QCChartsSection
                      stats={stats}
                      defectAnalysis={defectAnalysis}
                    />
                  </div>
                )}
             </motion.div>

             {/* Row 4: Historical Records */}
             <motion.div variants={itemVariants} className="w-full">
                <Card className="rounded-[2rem] border-2 border-cyan-100 bg-white shadow-lg overflow-hidden flex flex-col">
                  <div className="p-10 border-b border-cyan-100 flex items-center justify-between bg-cyan-50/30">
                    <h2 className="text-2xl font-black text-cyan-900 uppercase tracking-tighter">Production Audit Ledger</h2>
                    <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-cyan-100">Official Records</span>
                  </div>
                  <div className="overflow-x-auto">
                    <QCHistoryTable
                      qcChecks={qcChecksData?.checks ?? []}
                      loading={loadingChecks}
                    />
                  </div>
                </Card>
             </motion.div>
          </div>
        </div>
      </motion.div>
    );
  };
  
  export default QCDashboard;
