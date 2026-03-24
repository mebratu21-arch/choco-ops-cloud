import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Activity } from 'lucide-react';

interface AnalyticsData {
  productionTrends?: {
    date: string;
    started: number;
    completed: number;
  }[];
  qcTrends?: {
    date: string;
    rate: number;
  }[];
  inventoryStatus?: {
    adequate: number;
    lowStock: number;
    expired: number;
  };
  batchStatus?: {
    pending: number;
    mixing: number;
    cooking: number;
    cooling: number;
    packaging: number;
    completed: number;
    failed: number;
  };
  [key: string]: unknown;
}

interface ChartsSectionProps {
  analytics?: AnalyticsData;
  loading?: boolean;
}

// Chocolate-themed color palette
const COLORS = {
  primary: '#8B4513', // Saddle Brown (cocoa)
  secondary: '#D2691E', // Chocolate
  tertiary: '#CD853F', // Peru
  success: '#22c55e', // Green
  warning: '#f59e0b', // Amber
  danger: '#ef4444', // Red
  info: '#3b82f6', // Blue
  purple: '#8b5cf6', // Purple
  gray: '#6b7280', // Gray
};

const BATCH_COLORS = {
  pending: '#9ca3af',
  mixing: '#3b82f6',
  cooking: '#f97316',
  cooling: '#06b6d4',
  packaging: '#8b5cf6',
  completed: '#22c55e',
  failed: '#ef4444',
};

const INVENTORY_COLORS = {
  adequate: '#22c55e',
  lowStock: '#f59e0b',
  expired: '#ef4444',
};

// Generate mock data for demonstration
const generateMockProductionData = () => {
  const data = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      started: Math.floor(Math.random() * 15) + 5,
      completed: Math.floor(Math.random() * 12) + 3,
    });
  }
  return data;
};

const generateMockQCData = () => {
  const data = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      rate: Math.floor(Math.random() * 15) + 82, // 82-97%
    });
  }
  return data;
};

interface TooltipPayloadEntry {
  value: number;
  name: string;
  color?: string;
  payload?: unknown;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

interface LegendEntry {
  value: string;
  payload?: {
    value?: number;
    [key: string]: unknown;
  };
}

// Custom tooltip styles
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-slate-700 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
            {entry.name === 'Rate' ? '%' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Loading skeleton
const ChartSkeleton = () => (
  <div className="h-64 bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg animate-pulse flex items-center justify-center">
    <Activity className="w-8 h-8 text-slate-300 animate-pulse" />
  </div>
);

const ChartsSection: React.FC<ChartsSectionProps> = ({
  analytics,
  loading = false,
}) => {
  // Use analytics data or mock data
  const productionData = useMemo(() =>
    analytics?.productionTrends ?? generateMockProductionData(),
    [analytics?.productionTrends]
  );

  const qcData = useMemo(() =>
    analytics?.qcTrends ?? generateMockQCData(),
    [analytics?.qcTrends]
  );

  const inventoryData = useMemo(() => {
    const status = analytics?.inventoryStatus ?? {
      adequate: 120,
      lowStock: 25,
      expired: 8,
    };
    return [
      { name: 'Adequate', value: status.adequate, color: INVENTORY_COLORS.adequate },
      { name: 'Low Stock', value: status.lowStock, color: INVENTORY_COLORS.lowStock },
      { name: 'Expired', value: status.expired, color: INVENTORY_COLORS.expired },
    ];
  }, [analytics?.inventoryStatus]);

  const batchData = useMemo(() => {
    const status = analytics?.batchStatus ?? {
      pending: 5,
      mixing: 3,
      cooking: 4,
      cooling: 2,
      packaging: 3,
      completed: 45,
      failed: 2,
    };
    return [
      { name: 'Pending', value: status.pending, color: BATCH_COLORS.pending },
      { name: 'Mixing', value: status.mixing, color: BATCH_COLORS.mixing },
      { name: 'Cooking', value: status.cooking, color: BATCH_COLORS.cooking },
      { name: 'Cooling', value: status.cooling, color: BATCH_COLORS.cooling },
      { name: 'Packaging', value: status.packaging, color: BATCH_COLORS.packaging },
      { name: 'Completed', value: status.completed, color: BATCH_COLORS.completed },
      { name: 'Failed', value: status.failed, color: BATCH_COLORS.failed },
    ].filter(item => item.value > 0);
  }, [analytics?.batchStatus]);

  // Calculate totals for center display
  const inventoryTotal = inventoryData.reduce((sum, item) => sum + item.value, 0);
  const batchTotal = batchData.reduce((sum, item) => sum + item.value, 0);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Production Trend Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-5 h-5 text-cocoa-600" />
            Production Trend (30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={productionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStarted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.info} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.info} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area
                  type="monotone"
                  dataKey="started"
                  name="Started"
                  stroke={COLORS.info}
                  fillOpacity={1}
                  fill="url(#colorStarted)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  name="Completed"
                  stroke={COLORS.success}
                  fillOpacity={1}
                  fill="url(#colorCompleted)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* QC Approval Rate Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="w-5 h-5 text-green-600" />
            QC Approval Rate (30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={qcData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  domain={[70, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={90}
                  stroke={COLORS.warning}
                  strokeDasharray="5 5"
                  label={{ value: 'Target 90%', fontSize: 10, fill: COLORS.warning }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  name="Rate"
                  stroke={COLORS.success}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: COLORS.success }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Inventory Status Pie Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <PieChartIcon className="w-5 h-5 text-blue-600" />
            Inventory Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <div className="relative">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={inventoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {inventoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value} items (${((value / inventoryTotal) * 100).toFixed(1)}%)`,
                      name,
                    ]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px' }}
                    formatter={(value: string, entry: LegendEntry) => (
                        <span className="text-slate-600">
                          {value}: {entry.payload?.value ?? 0}
                        </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center total */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <div className="text-2xl font-bold text-cocoa-700">{inventoryTotal}</div>
                <div className="text-xs text-slate-500">Total Items</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Batch Status Distribution Pie Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <PieChartIcon className="w-5 h-5 text-amber-600" />
            Batch Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <div className="relative">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={batchData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {batchData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value} batches (${((value / batchTotal) * 100).toFixed(1)}%)`,
                      name,
                    ]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px' }}
                    formatter={(value: string, entry: LegendEntry) => (
                        <span className="text-slate-600 text-xs">
                          {value}: {entry.payload?.value ?? 0}
                        </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center total */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <div className="text-2xl font-bold text-cocoa-700">{batchTotal}</div>
                <div className="text-xs text-slate-500">Total Batches</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartsSection;
