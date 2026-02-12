import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  Wrench,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useMechanic } from '../../hooks/useMechanic';
import { MaintenanceLog, Machine } from '../../types';
import { useNavigate } from 'react-router-dom';

const MaintenanceHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { useMaintenanceLogs, useMachines } = useMechanic();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'preventive' | 'corrective' | 'emergency'>('all');
  const [machineFilter, setMachineFilter] = useState<string>('all');

  // Fetch data
  const { data: rawLogs = [], isLoading } = useMaintenanceLogs();
  const logs = Array.isArray(rawLogs) ? rawLogs : [];
  
  const { data: rawMachines = [] } = useMachines();
  const machines = Array.isArray(rawMachines) ? rawMachines : [];

  // Filter logic
  const filteredLogs = logs.filter((log: MaintenanceLog) => {
    const matchesSearch = 
      log.machine_name?.toLowerCase().includes(searchQuery.toLowerCase()) ??
      log.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || log.maintenance_type.toLowerCase() === typeFilter;
    const matchesMachine = machineFilter === 'all' || log.machine_id === machineFilter;

    return matchesSearch && matchesType && matchesMachine;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Maintenance Log History" 
        subtitle="Complete archive of all machine interventions and repairs."
        icon={History}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-chocolate-50/50 border-chocolate-100 shadow-sm border-l-4 border-l-chocolate-600">
          <CardContent className="p-4">
            <p className="text-[10px] font-black text-chocolate-400 uppercase tracking-widest mb-1">Total Logs</p>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-chocolate-900">{filteredLogs.length}</span>
              <History className="w-8 h-8 text-chocolate-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-rose-50 border-rose-100 shadow-sm border-l-4 border-l-rose-500">
          <CardContent className="p-4">
            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Emergency Runs</p>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-rose-900">
                {filteredLogs.filter(l => l.maintenance_type.toLowerCase() === 'emergency').length}
              </span>
              <AlertTriangle className="w-8 h-8 text-rose-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-cyan-50 border-cyan-100 shadow-sm border-l-4 border-l-cyan-500">
          <CardContent className="p-4">
            <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-1">Tech Hours</p>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-cyan-900">
                {Math.round(filteredLogs.reduce((acc, l) => acc + (l.duration_minutes || 0), 0) / 60)}h
              </span>
              <Clock className="w-8 h-8 text-cyan-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50 border-emerald-100 shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Spend</p>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-emerald-900">
                ${filteredLogs.reduce((acc, l) => acc + (l.cost || 0), 0).toLocaleString()}
              </span>
              <DollarSign className="w-8 h-8 text-emerald-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-3xl shadow-sm border border-chocolate-50">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-chocolate-400" />
          <Input 
            placeholder="Search by machine or description..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-chocolate-400" />
          <select 
            className="bg-white border border-chocolate-200 text-chocolate-900 text-sm rounded-lg focus:ring-chocolate-500 focus:border-chocolate-500 block w-full p-2"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
          >
            <option value="all">All Types</option>
            <option value="preventive">Preventive</option>
            <option value="corrective">Corrective</option>
            <option value="emergency">Emergency</option>
          </select>

          <select 
            className="bg-white border border-chocolate-200 text-chocolate-900 text-sm rounded-lg focus:ring-chocolate-500 focus:border-chocolate-500 block w-full p-2"
            value={machineFilter}
            onChange={(e) => setMachineFilter(e.target.value)}
          >
            <option value="all">All Machines</option>
            {machines.map((machine: Machine) => (
              <option key={machine.id} value={machine.id}>{machine.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table/List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-chocolate-50 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <Card className="rounded-3xl border-dashed border-2 py-12">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <History className="w-12 h-12 text-chocolate-200 mb-4" />
              <p className="text-chocolate-500 font-medium">No maintenance logs found matching your filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredLogs.map((log: MaintenanceLog) => (
              <Card key={log.id} className="rounded-3xl hover:shadow-lg transition-all duration-300 border-none bg-white shadow-sm overflow-hidden group">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Left: Machine Info */}
                    <div className="p-6 md:w-64 bg-chocolate-50/50 border-r border-chocolate-50">
                      <h4 className="font-black text-chocolate-900 uppercase tracking-tight mb-1">{log.machine_name}</h4>
                      <p className="text-[10px] font-black text-chocolate-400 uppercase tracking-widest mb-4">Unit Identifier</p>
                      <Badge variant={
                        log.maintenance_type.toLowerCase() === 'emergency' ? 'error' :
                        log.maintenance_type.toLowerCase() === 'corrective' ? 'warning' : 'default'
                      } className="uppercase tracking-widest text-[9px]">
                        {log.maintenance_type}
                      </Badge>
                    </div>

                    {/* Middle: Details */}
                    <div className="p-6 flex-1">
                      <div className="flex items-center gap-2 text-chocolate-400 mb-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">{formatDate(log.performed_at ?? log.date)}</span>
                      </div>
                      <p className="text-chocolate-800 text-sm font-medium leading-relaxed mb-4">{log.description}</p>
                      
                      <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-1.5 text-chocolate-500 bg-white px-3 py-1.5 rounded-xl border border-chocolate-100 shadow-sm">
                          <Wrench className="w-3.5 h-3.5 text-chocolate-400" />
                          <span className="text-[10px] font-black uppercase">{log.mechanic_name ?? log.performed_by_name ?? 'Mechanic'}</span>
                        </div>
                        {log.duration_minutes && (
                          <div className="flex items-center gap-1.5 text-chocolate-500">
                            <Clock className="w-3.5 h-3.5 text-chocolate-400" />
                            <span className="text-[10px] font-black uppercase">{log.duration_minutes} Minutes</span>
                          </div>
                        )}
                        {log.cost && (
                          <div className="flex items-center gap-1.5 text-emerald-600 font-black">
                            <DollarSign className="w-3.5 h-3.5" />
                            <span className="text-[10px] uppercase">${log.cost.toFixed(2)} USD</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="p-6 flex items-center justify-center border-l border-chocolate-50 group-hover:bg-chocolate-950 transition-colors">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => navigate(`/mechanic/machines/${log.machine_id}`)}
                        className="rounded-full group-hover:text-white transition-colors"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceHistoryPage;
