import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, Calendar, Filter, Plus, ChevronDown } from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';
import { InventoryItem, InventoryCategory } from '../../types';
import InventoryTable from '../../components/inventory/InventoryTable';
import InventorySearchBar from '../../components/inventory/InventorySearchBar';
import Pagination from '../../components/common/Pagination';
import StockUpdateModal from '../../components/inventory/StockUpdateModal';
import AddItemModal from '../../components/inventory/AddItemModal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import StatsCard from '../../components/dashboard/StatsCard';
import { toast } from 'sonner';

const InventoryPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  
  // Modals state
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);

  // Queries
  const { 
    useInventoryItems, 
    useSearchInventory, 
    useLowStockAlerts, 
    useExpiryAlerts,
    useDeleteItem 
  } = useInventory();

  // Determine which query to use
  const isSearching = !!searchQuery;
  
  const searchResult = useSearchInventory(searchQuery);
  const listResult = useInventoryItems({ 
    category: (categoryFilter as InventoryCategory) || undefined, 
    page: currentPage, 
    limit: pageSize 
  });

  const { 
    data: itemsData, 
    isLoading: isLoadingItems 
  } = isSearching ? searchResult : listResult;

  // Alerts data
  const { data: lowStockData } = useLowStockAlerts();
  const { data: expiryData } = useExpiryAlerts();
  
  // Mutations
  const deleteMutation = useDeleteItem();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleUpdateStock = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsStockModalOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditItem(item);
    setIsAddModalOpen(true);
  };

  const handleDeleteItem = async (item: InventoryItem) => {
    if (window.confirm(`Are you sure you want to decommission ${item.name}?`)) {
      try {
        await deleteMutation.mutateAsync(item.id);
        toast.success(`${item.name} decommissioned successfully`);
      } catch {
        toast.error('Failed to update asset status');
      }
    }
  };

  const items = (Array.isArray(itemsData) ? itemsData : itemsData?.items) ?? [];
  const totalItemsCount = Array.isArray(itemsData) ? itemsData.length : (itemsData?.meta?.total ?? itemsData?.items?.length ?? 0);

  return (
    <div className="min-h-screen bg-[#0F0805] p-6 space-y-12 animate-fadeIn relative pb-24 overflow-x-hidden">
      
      {/* ATMOSPHERIC BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-900/10 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-chocolate-900/10 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] contrast-200" />
      </div>

      {/* PREMIUM VAULT HEADER */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-[#1A0F0A] to-[#0A0503] p-16 text-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] border border-white/5 group"
      >
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/10 transition-all duration-1000" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-tr from-amber-600 to-amber-400 rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.3)] border border-white/20">
                <Package className="w-10 h-10 text-chocolate-950" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span className="text-[11px] font-black text-amber-500 uppercase tracking-[0.5em]">Security Clearance Alpha</span>
                </div>
                <h1 className="text-7xl font-black tracking-tighter leading-none">
                  ASSET <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-white/60">VAULT</span>
                </h1>
              </div>
            </div>
            <p className="text-white/40 font-bold max-w-xl text-lg leading-relaxed tracking-tight">
              High-fidelity oversight of global chocolate architecture. Monitoring structural integrity, stock metrics, and lifecycle synchronization.
            </p>
          </div>
          
          <Button 
            className="bg-white text-chocolate-950 px-12 py-10 rounded-[2.5rem] font-black text-sm tracking-[0.3em] shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:shadow-white/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 uppercase"
            onClick={() => { setEditItem(null); setIsAddModalOpen(true); }}
          >
            <Plus className="w-6 h-6 stroke-[3px]" /> Deploy Asset
          </Button>
        </div>
      </motion.div>

      {/* REFINED ANALYTICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <StatsCard
          title="Consolidated Reserve"
          value={totalItemsCount}
          icon={Package}
          color="primary"
          trend={{ value: 12, positive: true }}
          description="Global SKU Distribution"
        />

        <StatsCard
          title="Critical Depletion"
          value={lowStockData?.length ?? 0}
          icon={AlertTriangle}
          color="accent"
          trend={{ value: 5, positive: false }}
          description="Immediate Injection Required"
        />

        <StatsCard
          title="Stale Lifecycle"
          value={expiryData?.length ?? 0}
          icon={Calendar}
          color="red"
          description="Expiry Window: 30-Day Limit"
        />
      </div>

      {/* MAIN DATA HUB */}
      <div className="bg-[#1A0F0A]/40 rounded-[4rem] shadow-2xl backdrop-blur-3xl border border-white/5 overflow-hidden">
        <div className="p-12 border-b border-white/5 bg-transparent">
          <div className="flex flex-col lg:flex-row gap-10 justify-between items-center">
            {/* Search Protocol */}
            <div className="w-full lg:w-[500px] relative group">
              <InventorySearchBar onSearch={handleSearch} />
            </div>

            {/* Dimensional Filters */}
            <div className="flex items-center gap-6 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-72 group">
                <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-hover:text-amber-500 transition-colors" />
                <select 
                  className="w-full pl-14 pr-10 py-5 bg-white/5 border border-white/10 rounded-[1.5rem] text-[11px] font-black text-white uppercase tracking-[0.2em] focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all appearance-none cursor-pointer"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="" className="bg-chocolate-950">Vault: All Sectors</option>
                  <option value="raw_material" className="bg-chocolate-950">Raw Material Grid</option>
                  <option value="packaging" className="bg-chocolate-950">Packaging Protocols</option>
                  <option value="finished_good" className="bg-chocolate-950">Artisan Masterpieces</option>
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* High-Contrast Table Container */}
        <div className="bg-[#0F0805]/20 pb-10">
          <InventoryTable 
            items={items} 
            isLoading={isLoadingItems}
            onEdit={handleEditItem}
            onDelete={(item) => void handleDeleteItem(item)}
            onUpdateStock={handleUpdateStock}
            onAddItem={() => { setEditItem(null); setIsAddModalOpen(true); }}
          />
        </div>
        
        {/* Pagination */}
        {!isLoadingItems && itemsData && !Array.isArray(itemsData) && itemsData.meta && (
          <div className="px-12 py-8 border-t border-white/5 bg-white/2">
            <Pagination 
              currentPage={currentPage}
              totalPages={itemsData.meta.totalPages}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
              totalItems={itemsData.meta.total}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedItem && (
        <StockUpdateModal 
          isOpen={isStockModalOpen}
          onClose={() => {
            setIsStockModalOpen(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
        />
      )}

      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditItem(null);
        }}
        editItem={editItem}
      />
    </div>
  );
};

export default InventoryPage;
