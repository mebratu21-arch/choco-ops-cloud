import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Filter,
  Search,
  RefreshCw,
  Bell,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '../../components/layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import SOSAlertCard from '../../components/mechanic/SOSAlertCard';
import ResolveAlertModal from '../../components/mechanic/ResolveAlertModal';
import { useMechanic } from '../../hooks/useMechanic';
import { SOSAlert, AlertPriority, AlertStatus } from '../../types';

type TabType = 'open' | 'in_progress' | 'resolved' | 'all';

const SOSAlertsPage: React.FC = () => {
  const { useSOSAlerts, useCreateSOSAlert, useMachines } = useMechanic();
  const createSOSMutation = useCreateSOSAlert();
  const { data: machines = [] } = useMachines();

  // State
  const [activeTab, setActiveTab] = useState<TabType>('open');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<AlertPriority | 'all'>('all');
  const [selectedAlert, setSelectedAlert] = useState<SOSAlert | null>(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);

  // Fetch alerts based on active tab
  const statusFilter = activeTab === 'all' ? undefined : activeTab;
  const {
    data: rawAlerts = [],
    isLoading,
    refetch,
    isRefetching
  } = useSOSAlerts({
    status: statusFilter as AlertStatus | undefined,
    priority: priorityFilter === 'all' ? undefined : priorityFilter,
  });
  
  const alerts = Array.isArray(rawAlerts) ? rawAlerts : [];

  // Auto-refresh alerts every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      void refetch();
    }, 15000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Filter alerts by search query
  const filteredAlerts = alerts.filter((alert: SOSAlert) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      alert.machine_name?.toLowerCase().includes(query) ||
      alert.machine_code?.toLowerCase().includes(query) ||
      alert.problem_description.toLowerCase().includes(query)
    );
  });

  // Sort alerts by priority and time
  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime();
  });

  const handleRespond = (alert: SOSAlert) => {
    setSelectedAlert(alert);
    setIsResolveModalOpen(true);
  };

  const handleAlertResolved = () => {
    setIsResolveModalOpen(false);
    setSelectedAlert(null);
    void refetch();
    toast.success('Alert updated successfully');
  };

  const handleSimulateAlert = () => {
    if (machines.length === 0) {
      toast.error('No machines available to simulate alert');
      return;
    }

    const randomMachine = machines[0];
    createSOSMutation.mutate(
      {
        machineId: randomMachine.id,
        priority: 'high',
        problemDescription: `Simulated SOS signal for ${randomMachine.name}. Inspecting for potential calibration drift.`,
      },
      {
        onSuccess: () => {
          toast.success('SOS Signal Simulated', {
            description: `Alert triggered for ${randomMachine.name}`,
          });
          void refetch();
        },
      }
    );
  };

  const tabs = [
    { id: 'open' as TabType, label: 'Open', icon: AlertTriangle, color: 'text-red-600' },
    { id: 'in_progress' as TabType, label: 'In Progress', icon: Clock, color: 'text-amber-600' },
    { id: 'resolved' as TabType, label: 'Resolved', icon: CheckCircle, color: 'text-green-600' },
    { id: 'all' as TabType, label: 'All', icon: Bell, color: 'text-gray-600' },
  ];

  const priorities: { value: AlertPriority | 'all'; label: string; color: string }[] = [
    { value: 'all', label: 'All Priorities', color: 'bg-gray-100 text-gray-700' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-700' },
    { value: 'high', label: 'High', color: 'bg-red-50 text-red-600' },
    { value: 'medium', label: 'Medium', color: 'bg-amber-100 text-amber-700' },
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-600' },
  ];

  // Count alerts by status for badges
  const { data: rawOpenAlerts = [] } = useSOSAlerts({ status: 'open' });
  const openAlerts = Array.isArray(rawOpenAlerts) ? rawOpenAlerts : [];
  
  const { data: rawInProgressAlerts = [] } = useSOSAlerts({ status: 'in_progress' });
  const inProgressAlerts = Array.isArray(rawInProgressAlerts) ? rawInProgressAlerts : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="SOS Alerts"
        subtitle="Manage and respond to machine emergency alerts"
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleSimulateAlert}
              isLoading={createSOSMutation.isPending}
              className="border-rose-200 text-rose-600 hover:bg-rose-50"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Simulate Signal
            </Button>
            <Button
              variant="outline"
              onClick={() => { void refetch(); }}
              disabled={isRefetching}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-rose-50 border-rose-200 border-l-4 border-l-rose-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-rose-600 font-bold uppercase tracking-wider mb-1">Open Alerts</p>
                <p className="text-3xl font-black text-rose-800">{openAlerts.length}</p>
              </div>
              <div className="p-2 bg-rose-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-cyan-50 border-cyan-200 border-l-4 border-l-cyan-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-cyan-600 font-bold uppercase tracking-wider mb-1">In Progress</p>
                <p className="text-3xl font-black text-cyan-800">{inProgressAlerts.length}</p>
              </div>
              <div className="p-2 bg-cyan-100 rounded-xl">
                <Clock className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-200 border-l-4 border-l-amber-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mb-1">Critical Priority</p>
                <p className="text-3xl font-black text-amber-800">
                  {openAlerts.filter((a: SOSAlert) => a.priority === 'critical').length}
                </p>
              </div>
              <div className="p-2 bg-amber-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-amber-600 animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-200 border-l-4 border-l-emerald-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-1">Total Signals</p>
                <p className="text-3xl font-black text-emerald-800">{alerts.length}</p>
              </div>
              <div className="p-2 bg-emerald-100 rounded-xl">
                <Bell className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const count = tab.id === 'open'
              ? openAlerts.length
              : tab.id === 'in_progress'
              ? inProgressAlerts.length
              : undefined;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-chocolate-600 text-chocolate-700 bg-chocolate-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : ''}`} />
                <span className="font-medium">{tab.label}</span>
                {count !== undefined && count > 0 && (
                  <Badge
                    variant={tab.id === 'open' ? 'error' : 'warning'}
                    className="text-xs"
                  >
                    {count}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by machine name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as AlertPriority | 'all')}
            className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-chocolate-500 focus:border-chocolate-500 text-sm"
          >
            {priorities.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : sortedAlerts.length === 0 ? (
          <Card className="py-12">
            <CardContent className="text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No alerts found
              </h3>
              <p className="text-gray-500">
                {activeTab === 'open'
                  ? 'Great news! There are no open alerts at this time.'
                  : searchQuery
                  ? 'No alerts match your search criteria.'
                  : `No ${activeTab.replace('_', ' ')} alerts to display.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedAlerts.map((alert: SOSAlert) => (
              <SOSAlertCard
                key={alert.id}
                alert={alert}
                onRespond={() => handleRespond(alert)}
                onResolve={() => handleRespond(alert)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Results count */}
      {!isLoading && sortedAlerts.length > 0 && (
        <p className="text-sm text-gray-500 text-center">
          Showing {sortedAlerts.length} alert{sortedAlerts.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Resolve Modal */}
      {selectedAlert && (
        <ResolveAlertModal
          isOpen={isResolveModalOpen}
          onClose={() => {
            setIsResolveModalOpen(false);
            setSelectedAlert(null);
          }}
          alert={selectedAlert}
          onResolved={handleAlertResolved}
        />
      )}
    </div>
  );
};

export default SOSAlertsPage;
