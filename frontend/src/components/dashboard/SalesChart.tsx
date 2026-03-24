import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { TrendingUp, DollarSign, Calendar } from 'lucide-react';

const SALES_DATA = [
  { name: 'Mon', value: 4000 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 2000 },
  { name: 'Thu', value: 2780 },
  { name: 'Fri', value: 1890 },
  { name: 'Sat', value: 2390 },
  { name: 'Sun', value: 3490 },
];

const SalesChart = () => {
  return (
    <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-chocolate-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-5 h-5 text-cocoa-600" />
            <h3 className="text-lg font-bold text-chocolate-900">Weekly Revenue</h3>
          </div>
          <p className="text-sm text-cocoa-500">Sales performance across all channels</p>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-lg border border-cocoa-100 p-1">
          <button className="px-3 py-1 text-xs font-semibold bg-cocoa-100 text-cocoa-800 rounded-md">Weekly</button>
          <button className="px-3 py-1 text-xs font-semibold text-cocoa-500 hover:text-cocoa-700">Monthly</button>
        </div>
      </div>

      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={SALES_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#9ca3af' }}
            />
            <Tooltip 
              cursor={{ fill: '#fdf4ff' }}
              contentStyle={{ 
                backgroundColor: '#fff', 
                borderRadius: '12px', 
                border: 'none',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {SALES_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#7c2d12' : '#ca8a04'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-cocoa-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-600">+12.5% vs last week</span>
        </div>
        <button className="text-xs font-bold text-cocoa-600 hover:text-cocoa-800 flex items-center gap-1">
            VIEW REPORT <Calendar className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default SalesChart;
