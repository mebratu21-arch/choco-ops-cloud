import React, { useState } from 'react';
import { Search, Layers, PlayCircle } from 'lucide-react';
import { useProduction } from '../../hooks/useProduction';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import BatchCard from '../../components/production/BatchCard';
import PageHeader from '../../components/layout/PageHeader';
import { motion } from 'framer-motion';

const BatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const { useBatches } = useProduction();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Map tab to API filter
  const statusFilter = activeTab === 'all' ? undefined : 
                       activeTab === 'active' ? 'in_progress' : 
                       activeTab;

  const { data: batchesData, isLoading } = useBatches({
    status: statusFilter,
    // search: searchQuery // Assuming API supports search
  });

  const batches = [
    ...(batchesData?.batches ?? []),
    // Sample "In Progress" Batch
    {
      id: "sample-in-progress",
      batch_number: "BP-90210",
      recipe_name: "Signature Dark Truffles",
      status: "in_progress",
      target_quantity: 500,
      actual_quantity: 0,
      started_at: new Date(Date.now() - 45 * 60000).toISOString(),
      started_by: "user-1",
      operator_name: "Marco Rossi",
      classification: "Master Chocolatier"
    },
    // Sample "Failed" Batch
    {
      id: "sample-failed",
      batch_number: "BP-88722",
      recipe_name: "Milk Chocolate Bars",
      status: "failed",
      target_quantity: 1000,
      actual_quantity: 0,
      started_at: new Date(Date.now() - 120 * 60000).toISOString(),
      completed_at: new Date(Date.now() - 90 * 60000).toISOString(),
      started_by: "user-2",
      operator_name: "Sofia Chen",
      classification: "Quality Lead",
      failure_reason: "Insufficient ingredients: Dark Chocolate"
    }
  ];

  const tabs = [
    { id: 'all', label: 'All Batches' },
    { id: 'active', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'failed', label: 'Failed' },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      {/* Header */}
      <PageHeader 
        title="Production Batches" 
        subtitle="Track manufacturing cycles, manage active runs, and review production history."
        actions={
          <Button 
            onClick={() => navigate('/production/recipes')} 
            className="bg-gradient-to-r from-chocolate-600 to-chocolate-800 text-white shadow-lg shadow-chocolate-900/20 hover:shadow-chocolate-900/40 transition-all active:scale-95"
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            New Batch Run
          </Button>
        }
      />

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* Tabs */}
        <div className="flex p-1 bg-chocolate-100/50 rounded-xl border border-chocolate-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'all' | 'active' | 'completed' | 'failed')}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-chocolate-800 shadow-sm border border-chocolate-100'
                  : 'text-chocolate-600/70 hover:text-chocolate-800 hover:bg-white/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-chocolate-400" />
          <input
            type="text"
            placeholder="Search batches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-chocolate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all font-medium text-chocolate-900 placeholder:text-chocolate-300"
          />
        </div>
      </div>

      {/* Batches Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-3xl border border-chocolate-100 animate-pulse shadow-sm" />
          ))}
        </div>
      ) : batches.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {batches.filter(b => activeTab === 'all' || (activeTab === 'active' ? b.status === 'in_progress' : b.status === activeTab)).map((batch) => (
            <BatchCard key={batch.id} batch={batch as any} />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-20 bg-chocolate-50/30 rounded-3xl border border-dashed border-chocolate-200">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-chocolate-100">
            <Layers className="w-8 h-8 text-chocolate-300" />
          </div>
          <h3 className="text-lg font-bold text-chocolate-900">No batches found</h3>
          <p className="text-chocolate-500 mt-1 font-medium">
            {activeTab === 'all' 
              ? "Start production from the Recipes page." 
              : `No ${activeTab} batches found.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default BatchesPage;
