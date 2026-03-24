import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Package,
  AlertTriangle,
  Activity,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import { InventoryItem } from '../../types';

const DashboardPage = () => {
  const { user } = useAuth();
  const [lowStockCount, setLowStockCount] = useState(0);
  const [totalInventory, setTotalInventory] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { items } = await inventoryService.getAllItems();
        setTotalInventory(items.length);
        setLowStockCount(items.filter((i: InventoryItem) => i.quantity <= i.reorder_level).length);
      } catch (error) {
        console.error("Dashboard data fetch error", error);
      }
    };
    void fetchData();
  }, []);

  const stats = [
    {
      title: 'Total Inventory',
      value: totalInventory,
      subtitle: 'Items in stock',
      icon: Package,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Active Batches',
      value: 3,
      subtitle: 'In production',
      icon: Activity,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Low Stock',
      value: lowStockCount,
      subtitle: 'Need reorder',
      icon: AlertTriangle,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      title: 'Efficiency',
      value: '98.4%',
      subtitle: 'Production rate',
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    }
  ];

  const activities = [
    {
      title: 'New Batch Started',
      desc: 'Dark Chocolate 70% - Batch #B-2026-002',
      time: '10 mins ago',
      icon: Zap,
      color: 'bg-yellow-500'
    },
    {
      title: 'Quality Check Passed',
      desc: 'Batch #B-2026-001 approved by QC',
      time: '2 hours ago',
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Inventory Alert',
      desc: 'Cocoa Butter below threshold',
      time: '4 hours ago',
      icon: AlertTriangle,
      color: 'bg-red-500'
    },
    {
      title: 'Shift Change',
      desc: 'Morning shift started - 24 workers',
      time: '6 hours ago',
      icon: Users,
      color: 'bg-blue-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.full_name?.split(' ')[0] ?? 'Admin'}
        </h1>
        <p className="text-gray-500 mt-1">Here's what's happening in your factory today.</p>
      </div>

      {/* Stats Grid - 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              <p className="text-gray-400 text-sm mt-1">{stat.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Production Overview</h2>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-600">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <div className="text-center">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Production Chart</p>
              <p className="text-gray-400 text-sm">Chart visualization coming soon</p>
            </div>
          </div>
        </div>

        {/* Activity Feed - Takes 1 column */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${activity.color} flex-shrink-0`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500 truncate">{activity.desc}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all text-left">
          <Package className="w-6 h-6 text-blue-500 mb-2" />
          <p className="font-medium text-gray-900">Inventory</p>
          <p className="text-sm text-gray-500">Manage stock</p>
        </button>
        <button className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all text-left">
          <Activity className="w-6 h-6 text-purple-500 mb-2" />
          <p className="font-medium text-gray-900">Production</p>
          <p className="text-sm text-gray-500">View batches</p>
        </button>
        <button className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all text-left">
          <CheckCircle className="w-6 h-6 text-green-500 mb-2" />
          <p className="font-medium text-gray-900">Quality</p>
          <p className="text-sm text-gray-500">QC checks</p>
        </button>
        <button className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all text-left">
          <Users className="w-6 h-6 text-orange-500 mb-2" />
          <p className="font-medium text-gray-900">Team</p>
          <p className="text-sm text-gray-500">Staff overview</p>
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
