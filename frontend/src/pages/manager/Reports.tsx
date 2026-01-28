import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

const Reports = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white font-serif tracking-tight">Executive Reports</h2>
        <div className="text-slate-400 text-sm">Last updated: Just now</div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-900/30 rounded-lg text-blue-500">
                <BarChart3 className="h-6 w-6" />
              </div>
              <span className="text-green-500 text-sm font-medium flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +12%
              </span>
            </div>
            <h3 className="text-slate-400 text-sm font-medium">Production Output</h3>
            <p className="text-2xl font-bold text-white mt-1">1,250 kg</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-red-900/30 rounded-lg text-red-500">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <span className="text-red-500 text-sm font-medium flex items-center gap-1">
                +2%
              </span>
            </div>
            <h3 className="text-slate-400 text-sm font-medium">QC Reject Rate</h3>
            <p className="text-2xl font-bold text-white mt-1">4.2%</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-900/30 rounded-lg text-green-500">
                <CheckCircle className="h-6 w-6" />
              </div>
              <span className="text-green-500 text-sm font-medium flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> 98%
              </span>
            </div>
            <h3 className="text-slate-400 text-sm font-medium">On-Time Delivery</h3>
            <p className="text-2xl font-bold text-white mt-1">98.5%</p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
                <CardTitle className="text-white">Weekly Production</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-64 flex items-end justify-between gap-2 mt-4">
                    {[65, 45, 75, 55, 85, 95, 70].map((h, i) => (
                        <div key={i} className="w-full bg-slate-800 rounded-t-sm relative group">
                            <div 
                                className="absolute bottom-0 w-full bg-gold-600 rounded-t-sm transition-all duration-500 hover:bg-gold-500"
                                style={{ height: `${h}%` }}
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {h}%
                                </div>
                            </div>
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-500">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
                <CardTitle className="text-white">Inventory Health</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[
                        { label: 'Raw Cocoa', val: 85, color: 'bg-green-500' },
                        { label: 'Sugar', val: 45, color: 'bg-yellow-500' },
                        { label: 'Milk Powder', val: 92, color: 'bg-green-500' },
                        { label: 'Packaging', val: 15, color: 'bg-red-500' },
                    ].map((item) => (
                        <div key={item.label}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-300">{item.label}</span>
                                <span className="text-slate-400">{item.val}%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full ${item.color}`} 
                                    style={{ width: `${item.val}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
