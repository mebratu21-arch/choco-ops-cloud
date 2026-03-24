import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Wrench,
  AlertTriangle,
  Calendar,
  MapPin,
  Settings,
  Clock,
  FileText,
  History,
  Bell,
  DollarSign,
} from 'lucide-react';
import { PageHeaderCompact } from '../../components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import MaintenanceLogModal from '../../components/mechanic/MaintenanceLogModal';
import SOSAlertCard from '../../components/mechanic/SOSAlertCard';
import ResolveAlertModal from '../../components/mechanic/ResolveAlertModal';
import { useMechanic } from '../../hooks/useMechanic';
import { MachineStatus, MaintenanceLog, SOSAlert } from '../../types';

type TabType = 'overview' | 'alerts';

const MachineDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useMachine, useMaintenanceLogs, useSOSAlerts } = useMechanic();

  const { data: machine, isLoading: machineLoading } = useMachine(id ?? '');
  const { data: maintenanceLogs = [] } = useMaintenanceLogs(id ? { machine_id: id } : {});
  const { data: rawMachineAlerts = [] } = useSOSAlerts(id ? { machine_id: id } : {});
  const machineAlerts = Array.isArray(rawMachineAlerts) ? rawMachineAlerts : [];

  // State
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<SOSAlert | null>(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);

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
      default:
        return { color: 'bg-gray-400', bgColor: 'bg-gray-50 border-gray-200', textColor: 'text-gray-600', variant: 'default' as const };
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: Settings },
    { id: 'maintenance' as TabType, label: 'Maintenance History', icon: History },
    { id: 'alerts' as TabType, label: 'SOS History', icon: Bell },
  ];

  if (machineLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-3xl border border-chocolate-100 animate-pulse shadow-sm" />
          ))}
        </div>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="text-center py-12">
        <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Machine Not Found</h2>
        <p className="text-gray-500 mb-4">The machine you're looking for doesn't exist.</p>
        <Button variant="outline" onClick={() => navigate('/mechanic/machines')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Machines
        </Button>
      </div>
    );
  }

  const statusConfig = getStatusConfig(machine.status);
  const openAlerts = machineAlerts.filter((a) => a.status === 'open' || a.status === 'in_progress');

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeaderCompact
        title={machine.name}
        backLink="/mechanic/machines"
        backLabel="Back to Machines"
        actions={
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={() => { console.log('SOS creation not implemented'); }} // TODO: Implement SOS creation
              disabled={machine.status === 'repair'}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Create SOS Alert
            </Button>
            <Button variant="default" onClick={() => setIsMaintenanceModalOpen(true)}>
              <Wrench className="w-4 h-4 mr-2" />
              Log Maintenance
            </Button>
          </div>
        }
      />

      {/* Machine Header Card */}
      <Card className={`border-2 ${statusConfig.bgColor}`}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-xl ${statusConfig.color} flex items-center justify-center ${machine.status === 'repair' ? 'animate-pulse' : ''}`}>
                <Settings className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-chocolate-800">{machine.name}</h1>
                  <Badge variant={statusConfig.variant} className="text-sm">
                    {machine.status}
                  </Badge>
                </div>
                <p className="text-gray-600">{machine.type}</p>
                <p className="text-sm font-mono text-gray-500">{machine.machine_code}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-5 h-5" />
              <span className="text-lg">{machine.location}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Open Alerts Warning */}
      {openAlerts.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="font-bold text-red-800">
              {openAlerts.length} Active Alert{openAlerts.length > 1 ? 's' : ''}
            </h3>
          </div>
          <div className="space-y-2">
            {openAlerts.slice(0, 2).map((alert: SOSAlert) => (
              <SOSAlertCard
                key={alert.id}
                alert={alert}
                onRespond={() => {
                  setSelectedAlert(alert);
                  setIsResolveModalOpen(true);
                }}
                compact
              />
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-chocolate-600 text-chocolate-700 bg-chocolate-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="font-medium">Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'alerts'
                ? 'border-chocolate-600 text-chocolate-700 bg-chocolate-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span className="font-medium">SOS History</span>
            {machineAlerts.length > 0 && (
              <Badge variant="error" className="ml-2">
                {machineAlerts.length}
              </Badge>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Machine Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-chocolate-600" />
                Machine Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Type</span>
                <span className="font-medium">{machine.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Code</span>
                <span className="font-mono">{machine.machine_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location</span>
                <span className="font-medium">{machine.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <Badge variant={statusConfig.variant}>{machine.status}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-chocolate-600" />
                Maintenance Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Last Maintenance</span>
                <span className="font-medium">{formatDate(machine.last_maintenance_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Next Scheduled</span>
                <span className={`font-medium ${machine.next_maintenance_date && new Date(machine.next_maintenance_date) <= new Date() ? 'text-red-600' : ''}`}>
                  {formatDate(machine.next_maintenance_date)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Logs</span>
                <span className="font-medium">{maintenanceLogs.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-chocolate-600" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Maintenance</span>
                <span className="font-medium">{maintenanceLogs.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total SOS Alerts</span>
                <span className="font-medium">{machineAlerts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Open Alerts</span>
                <span className={`font-medium ${openAlerts.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {openAlerts.length}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {machine.notes && (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-chocolate-600" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{machine.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}


      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {machineAlerts.length === 0 ? (
            <Card className="py-12">
              <CardContent className="text-center">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No SOS Alert History
                </h3>
                <p className="text-gray-500">
                  No SOS alerts have been reported for this machine.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {machineAlerts.map((alert: SOSAlert) => (
                <SOSAlertCard
                  key={alert.id}
                  alert={alert}
                  onRespond={() => {
                    setSelectedAlert(alert);
                    setIsResolveModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <MaintenanceLogModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        machineId={id}
      />

      {selectedAlert && (
        <ResolveAlertModal
          isOpen={isResolveModalOpen}
          onClose={() => {
            setIsResolveModalOpen(false);
            setSelectedAlert(null);
          }}
          alert={selectedAlert}
          onResolved={() => {
            setIsResolveModalOpen(false);
            setSelectedAlert(null);
          }}
        />
      )}
    </div>
  );
};

export default MachineDetailPage;
