import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Factory, AlertCircle, CheckCircle } from 'lucide-react';
import ProductionBatches from './ProductionBatches';

const ProductionDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white font-serif tracking-tight">Production Floor</h2>
          <p className="text-slate-400">Real-time Batch Tracking</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800 border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 font-medium">Active Batches</span>
              <Factory className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-white">4</div>
            <p className="text-xs text-blue-400 mt-1">Currently on line</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 font-medium">Delayed</span>
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-white">1</div>
            <p className="text-xs text-red-400 mt-1">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 font-medium">Completed Today</span>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-white">18</div>
            <p className="text-xs text-green-400 mt-1">Target: 20</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area - Batches Table */}
      <ProductionBatches />
    </div>
  );
};

export default ProductionDashboard;
