import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Factory,
  CheckCircle2,
  Wrench,
  Megaphone,
  ListTodo,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Download,
  Clock,
  Users,
  DollarSign,
  BarChart3,
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import MetricsCard from '../../components/manager/MetricsCard';
import ChartsSection from '../../components/manager/ChartsSection';
import ActivityTimeline from '../../components/manager/ActivityTimeline';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

// Department card configuration
const departments = [
  {
    id: 'inventory',
    title: 'Inventory',
    description: 'Manage warehouse stock and materials',
    icon: Package,
    href: '/inventory',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    borderColor: 'border-blue-200',
  },
  {
    id: 'production',
    title: 'Production',
    description: 'Monitor batches and recipes',
    icon: Factory,
    href: '/batches',
    color: 'bg-amber-500',
    bgColor: 'bg-amber-50 hover:bg-amber-100',
    borderColor: 'border-amber-200',
  },
  {
    id: 'qc',
    title: 'Quality Control',
    description: 'Review inspections and approvals',
    icon: CheckCircle2,
    href: '/qc',
    color: 'bg-green-500',
    bgColor: 'bg-green-50 hover:bg-green-100',
    borderColor: 'border-green-200',
  },
  {
    id: 'maintenance',
    title: 'Maintenance',
    description: 'Machine status and SOS alerts',
    icon: Wrench,
    href: '/mechanic',
    color: 'bg-red-500',
    bgColor: 'bg-red-50 hover:bg-red-100',
    borderColor: 'border-red-200',
  },
  {
    id: 'announcements',
    title: 'Announcements',
    description: 'Broadcast messages to staff',
    icon: Megaphone,
    href: '/manager/announcements',
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50 hover:bg-purple-100',
    borderColor: 'border-purple-200',
  },
  {
    id: 'tasks',
    title: 'Tasks',
    description: 'Assign and track team tasks',
    icon: ListTodo,
    href: '/manager/tasks',
    color: 'bg-indigo-500',
    bgColor: 'bg-indigo-50 hover:bg-indigo-100',
    borderColor: 'border-indigo-200',
  },
];

const ManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { useCurrentUser } = useAuth();
  useCurrentUser();
  const { stats, loading: statsLoading, refetch: refetchStats } = useDashboardStats();
  const { analytics, loading: analyticsLoading, refetch: refetchAnalytics } = useAnalytics();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      void refetchStats();
      void refetchAnalytics();
    }, 60000);
    return () => clearInterval(interval);
  }, [refetchStats, refetchAnalytics]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchStats(), refetchAnalytics()]);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Format current date/time
  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Calculate QC approval rate color
  const getQCRateColor = (rate: number): 'success' | 'warning' | 'danger' => {
    if (rate >= 90) return 'success';
    if (rate >= 80) return 'warning';
    return 'danger';
  };

  // Map metrics from nested stats
  const dashboardMetrics = {
    totalInventoryItems: stats?.inventory_summary?.total_items ?? 156,
    inventoryTrend: 5.2,
    lowStockItems: stats?.inventory_summary?.low_stock_count ?? 8,
    activeBatches: stats?.production_summary?.active_batches ?? 12,
    batchBreakdown: { mixing: 3, cooking: 4, cooling: 2, packaging: 3 },
    completedToday: stats?.production_summary?.completed_today ?? 24,
    qcApprovalRate: stats?.qc_summary?.pass_rate ?? 92.5,
    qcTrend: 2.1,
    openAlerts: stats?.mechanics_summary?.active_alerts ?? 2,
    pendingTasks: stats?.qc_summary?.pending_inspections ?? 7,
    revenueToday: 12450,
  };

  // Mock activity data (will be replaced by real API data)
  const recentActivities = analytics?.recentActivities ?? [
    {
      id: '1',
      type: 'batch_started',
      description: 'John started batch #MB-2025-0042',
      user: 'John Smith',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    },
    {
      id: '2',
      type: 'qc_completed',
      description: 'QC check completed for batch #MB-2025-0041',
      user: 'Sarah Johnson',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    },
    {
      id: '3',
      type: 'stock_updated',
      description: 'Cocoa powder stock updated (+50kg)',
      user: 'Mike Wilson',
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    },
    {
      id: '4',
      type: 'sos_alert',
      description: 'SOS Alert: Tempering machine #TEMP-002 malfunction',
      user: 'System',
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    },
    {
      id: '5',
      type: 'batch_completed',
      description: 'Batch #MB-2025-0040 completed successfully',
      user: 'Emma Davis',
      timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
    },
    {
      id: '6',
      type: 'task_completed',
      description: 'Equipment inspection task completed',
      user: 'Robert Brown',
      timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
    },
    {
      id: '7',
      type: 'announcement',
      description: 'New safety guidelines posted',
      user: 'Admin',
      timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <PageHeader
          title="Manager Command Center"
          subtitle={`${formattedDate} • ${formattedTime}`}
          icon={LayoutDashboard}
        />
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { void handleRefresh(); }}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Total Inventory Items"
          value={dashboardMetrics.totalInventoryItems}
          icon={Package}
          trend="up"
          trendValue={dashboardMetrics.inventoryTrend}
          color="default"
          subtitle="Across all categories"
          onClick={() => navigate('/inventory')}
          loading={statsLoading}
        />
        <MetricsCard
          title="Low Stock Items"
          value={dashboardMetrics.lowStockItems}
          icon={AlertTriangle}
          color={dashboardMetrics.lowStockItems > 10 ? 'danger' : dashboardMetrics.lowStockItems > 5 ? 'warning' : 'success'}
          subtitle="Require reorder"
          onClick={() => navigate('/inventory?filter=low-stock')}
          loading={statsLoading}
        />
        <MetricsCard
          title="Active Batches"
          value={dashboardMetrics.activeBatches}
          icon={Factory}
          color="default"
          subtitle={`Mixing: ${dashboardMetrics.batchBreakdown.mixing} | Cooking: ${dashboardMetrics.batchBreakdown.cooking}`}
          onClick={() => navigate('/batches?status=active')}
          loading={statsLoading}
        />
        <MetricsCard
          title="Completed Today"
          value={dashboardMetrics.completedToday}
          icon={CheckCircle2}
          color="success"
          trend="up"
          trendValue={12}
          subtitle="Production batches"
          onClick={() => navigate('/batches?status=completed&date=today')}
          loading={statsLoading}
        />
        <MetricsCard
          title="QC Approval Rate"
          value={dashboardMetrics.qcApprovalRate}
          icon={BarChart3}
          suffix="%"
          trend={dashboardMetrics.qcTrend > 0 ? 'up' : 'down'}
          trendValue={Math.abs(dashboardMetrics.qcTrend)}
          color={getQCRateColor(dashboardMetrics.qcApprovalRate)}
          subtitle="Last 30 days"
          onClick={() => navigate('/qc')}
          loading={analyticsLoading}
        />
        <MetricsCard
          title="Open SOS Alerts"
          value={dashboardMetrics.openAlerts}
          icon={AlertTriangle}
          color={dashboardMetrics.openAlerts > 0 ? 'danger' : 'success'}
          subtitle={dashboardMetrics.openAlerts > 0 ? 'Require attention' : 'All clear'}
          onClick={() => navigate('/mechanic/alerts')}
          loading={statsLoading}
        />
        <MetricsCard
          title="Pending Tasks"
          value={dashboardMetrics.pendingTasks}
          icon={ListTodo}
          color={dashboardMetrics.pendingTasks > 5 ? 'warning' : 'default'}
          subtitle="Assigned to team"
          onClick={() => navigate('/manager/tasks')}
          loading={statsLoading}
        />
        <MetricsCard
          title="Revenue Today"
          value={dashboardMetrics.revenueToday}
          icon={DollarSign}
          prefix="$"
          color="success"
          trend="up"
          trendValue={8.5}
          subtitle="From completed orders"
          loading={statsLoading}
        />
      </div>

      {/* Main Content - Charts & Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Charts Section - 2 columns */}
        <div className="xl:col-span-2">
          <ChartsSection
            analytics={analytics}
            loading={analyticsLoading}
          />
        </div>

        {/* Activity Timeline - 1 column */}
        <div className="xl:col-span-1">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-cocoa-600" />
                Recent Activity
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                Live
              </Badge>
            </CardHeader>
            <CardContent>
              <ActivityTimeline
                activities={recentActivities}
                loading={statsLoading}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Department Cards */}
      <div>
        <h2 className="text-lg font-semibold text-cocoa-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Department Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {departments.map((dept) => {
            const Icon = dept.icon;
            return (
              <button
                key={dept.id}
                onClick={() => navigate(dept.href)}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all duration-200 text-left group",
                  dept.bgColor,
                  dept.borderColor,
                  "hover:shadow-md hover:scale-[1.02]"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110",
                  dept.color
                )}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-cocoa-900 mb-1">
                  {dept.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {dept.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Stats Footer */}
      <Card className="bg-gradient-to-r from-cocoa-50 to-chocolate-50 border-cocoa-200">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="text-sm">
                <span className="text-slate-500">Last updated:</span>
                <span className="ml-2 font-medium text-cocoa-700">
                  {formattedTime}
                </span>
              </div>
              <div className="h-4 w-px bg-slate-300" />
              <div className="text-sm">
                <span className="text-slate-500">Auto-refresh:</span>
                <span className="ml-2 font-medium text-green-600">Every 60s</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-slate-600">System Online</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-green-600 font-medium">+15% productivity</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerDashboard;
