import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Wrench,
  AlertTriangle,
  History,
  Activity,
  MapPin,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import MaintenanceLogModal from '../../components/mechanic/MaintenanceLogModal';
import RegisterMachineModal from '../../components/mechanic/RegisterMachineModal';
import { useMechanic } from '../../hooks/useMechanic';
import { Machine, MachineStatus } from '../../types';

const MachinesPage: React.FC = () => {
  const navigate = useNavigate();
  const { useMachines } = useMechanic();
  const { data: machines = [], isLoading } = useMachines();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MachineStatus | 'all'>('all');
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState<string | undefined>();

  // Filter machines
  const filteredMachines = machines.filter((machine: Machine) => {
    // Status filter
    if (statusFilter !== 'all' && machine.status !== statusFilter) return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        machine.name.toLowerCase().includes(query) ||
        machine.machine_code.toLowerCase().includes(query) ||
        machine.type.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Sort by next maintenance date (urgent first)
  const sortedMachines = [...filteredMachines].sort((a, b) => {
    // Machines needing repair/maintenance/sos first
    const statusOrder: Record<string, number> = { sos: 0, repair: 1, maintenance: 2, offline: 3, standby: 4, operational: 5 };
    const statusDiff = (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99);
    if (statusDiff !== 0) return statusDiff;

    // Then by next maintenance date
    if (a.next_maintenance_date && b.next_maintenance_date) {
      return new Date(a.next_maintenance_date).getTime() - new Date(b.next_maintenance_date).getTime();
    }
    return 0;
  });

  const getStatusConfig = (status: MachineStatus) => {
    switch (status) {
      case 'operational':
        return { color: 'bg-green-500', bgColor: 'bg-green-50 border-green-200', textColor: 'text-green-700', variant: 'success' as const };
      case 'maintenance':
        return { color: 'bg-amber-500', bgColor: 'bg-amber-50 border-amber-200', textColor: 'text-amber-700', variant: 'warning' as const };
      case 'repair':
        return { color: 'bg-red-500', bgColor: 'bg-red-50 border-red-200', textColor: 'text-red-700', variant: 'error' as const };
      case 'offline':
        return { color: 'bg-gray-500', bgColor: 'bg-gray-50 border-gray-200', textColor: 'text-gray-700', variant: 'default' as const };
      case 'standby':
        return { color: 'bg-blue-500', bgColor: 'bg-blue-50 border-blue-200', textColor: 'text-blue-700', variant: 'default' as const };
      case 'sos':
        return { color: 'bg-red-600', bgColor: 'bg-red-50 border-red-300 shadow-sm', textColor: 'text-red-800', variant: 'error' as const };
      default:
        return { color: 'bg-gray-400', bgColor: 'bg-gray-50 border-gray-200', textColor: 'text-gray-600', variant: 'default' as const };
    }
  };

  const isMaintenanceDue = (machine: Machine): boolean => {
    if (!machine.next_maintenance_date) return false;
    const nextDate = new Date(machine.next_maintenance_date);
    const now = new Date();
    const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return nextDate <= oneWeekLater;
  };

  const handleLogMaintenance = (machineId: string) => {
    setSelectedMachineId(machineId);
    setIsMaintenanceModalOpen(true);
  };

  const statusOptions: { value: MachineStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Statuses' },
    { value: 'operational', label: 'Operational' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'repair', label: 'Repair' },
    { value: 'offline', label: 'Offline' },
    { value: 'standby', label: 'Standby' },
  ];
  
  const { useMaintenanceLogs } = useMechanic();
  const { data: recentLogs = [] } = useMaintenanceLogs();

  // Stats
  const operationalCount = machines.filter((m: Machine) => m.status === 'operational').length;
  const maintenanceCount = machines.filter((m: Machine) => m.status === 'maintenance' || m.status === 'repair').length;

  // New Stats Logic
  const sosCount = machines.filter((m: Machine) => m.status === 'sos' || m.status === 'repair').length;
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentWorkCount = Array.isArray(recentLogs) ? recentLogs.filter((l) => new Date(l.performed_at ?? l.date) >= weekAgo).length : 0;
  const complianceRate = machines.length > 0 ? Math.round((operationalCount / machines.length) * 100) : 0;
  const totalParts = Array.isArray(recentLogs) ? recentLogs.reduce((acc, l) => acc + (l.parts_used ? l.parts_used.split(',').length : 0), 0) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Machines"
        subtitle="View and manage all factory machines"
        icon={Settings}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/mechanic/history')}
              className="border-chocolate-200 text-chocolate-600 hover:bg-chocolate-50"
            >
              <History className="w-4 h-4 mr-2" />
              All History
            </Button>
            <Button onClick={() => setIsRegisterModalOpen(true)} className="bg-chocolate-600 hover:bg-chocolate-700">
              <Plus className="w-4 h-4 mr-2" />
              Register Machine
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">Total Machines</p>
                <p className="text-2xl font-bold text-gray-800">{machines.length}</p>
              </div>
              <Settings className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 font-medium">Operational</p>
                <p className="text-2xl font-bold text-green-800">{operationalCount}</p>
              </div>
              <Wrench className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-600 font-medium">Needs Attention</p>
                <p className="text-2xl font-bold text-amber-800">{maintenanceCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-medium">Compliance</p>
                <p className="text-2xl font-bold text-blue-800">{complianceRate}%</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-red-50 border-red-200 shadow-sm border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-600 font-medium font-mono uppercase tracking-wider">Active SOS</p>
                <p className="text-3xl font-black text-red-800">{sosCount}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-cyan-50 border-cyan-200 shadow-sm border-l-4 border-l-cyan-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-600 font-medium font-mono uppercase tracking-wider">Weekly Work</p>
                <p className="text-3xl font-black text-cyan-800">{recentWorkCount}</p>
              </div>
              <History className="w-10 h-10 text-cyan-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-200 shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-600 font-medium font-mono uppercase tracking-wider">Health Index</p>
                <p className="text-3xl font-black text-emerald-800">{complianceRate}</p>
              </div>
              <ShieldCheck className="w-10 h-10 text-emerald-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-indigo-50 border-indigo-200 shadow-sm border-l-4 border-l-indigo-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-indigo-600 font-medium font-mono uppercase tracking-wider">Parts Tracked</p>
                <p className="text-3xl font-black text-indigo-800">{totalParts}</p>
              </div>
              <Activity className="w-10 h-10 text-indigo-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as MachineStatus | 'all')}
            className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-chocolate-500 focus:border-chocolate-500 text-sm"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Machines Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : sortedMachines.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No machines found
            </h3>
            <p className="text-gray-500">
              {searchQuery || statusFilter !== 'all'
                ? 'No machines match your search criteria.'
                : 'No machines have been registered yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedMachines.map((machine: Machine) => {
            const config = getStatusConfig(machine.status);
            const maintenanceDue = isMaintenanceDue(machine);

            return (
              <Card
                key={machine.id}
                className={`border-2 hover:shadow-lg transition-all cursor-pointer ${config.bgColor}`}
                onClick={() => navigate(`/mechanic/machines/${machine.id}`)}
              >
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${config.color} ${machine.status === 'repair' ? 'animate-pulse' : ''}`} />
                      <Badge variant={config.variant}>{machine.status}</Badge>
                    </div>
                    <span className="text-xs font-mono text-gray-500">
                      {machine.machine_code}
                    </span>
                  </div>

                  {/* Machine Info */}
                  <h3 className="font-bold text-lg text-chocolate-800 mb-1">
                    {machine.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{machine.type}</p>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{machine.location}</span>
                  </div>

                  {/* Maintenance Info */}
                  <div className="space-y-2 text-sm">
                    {machine.last_maintenance_date && (
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Last Maintenance:</span>
                        <span>{new Date(machine.last_maintenance_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {machine.next_maintenance_date && (
                      <div className={`flex items-center justify-between ${maintenanceDue ? 'text-amber-600 font-medium' : 'text-gray-600'}`}>
                        <span>Next Due:</span>
                        <span className="flex items-center gap-1">
                          {maintenanceDue && <AlertTriangle className="w-3 h-3" />}
                          {new Date(machine.next_maintenance_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/mechanic/machines/${machine.id}`);
                      }}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLogMaintenance(machine.id);
                      }}
                    >
                      <Wrench className="w-3 h-3 mr-1" />
                      Log
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Results count */}
      {!isLoading && sortedMachines.length > 0 && (
        <p className="text-sm text-gray-500 text-center">
          Showing {sortedMachines.length} of {machines.length} machines
        </p>
      )}

      {/* Maintenance Log Modal */}
      <MaintenanceLogModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => {
          setIsMaintenanceModalOpen(false);
          setSelectedMachineId(undefined);
        }}
        machineId={selectedMachineId}
      />

      {/* Register Machine Modal */}
      <RegisterMachineModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </div>
  );
};

export default MachinesPage;
