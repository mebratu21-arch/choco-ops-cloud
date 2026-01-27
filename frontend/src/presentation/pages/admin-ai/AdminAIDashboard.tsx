import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/presentation/components/ui/Table'; // Reusing components or assuming they exist
import { Card as UICard, CardHeader as UICardHeader, CardTitle as UICardTitle, CardContent as UICardContent } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Cpu, Settings2, ShieldAlert, LineChart } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';

export default function AdminAIDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">AI Control Center</h1>
          <p className="text-slate-500">Manage neural rules and automation logic for the factory.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UICard className="col-span-2">
          <UICardHeader>
            <UICardTitle>Model Performance</UICardTitle>
            <p className="text-sm text-slate-500">Real-time inference stats across factory modules.</p>
          </UICardHeader>
          <UICardContent className="h-64 flex items-center justify-center bg-slate-50 rounded-md border border-dashed text-slate-400">
             [Performance Graph Placeholder]
          </UICardContent>
        </UICard>

        <div className="space-y-6">
          <UICard>
             <UICardHeader>
               <UICardTitle className="text-sm flex items-center gap-2">
                 <Cpu size={16} /> Engine Status
               </UICardTitle>
             </UICardHeader>
             <UICardContent>
               <div className="flex items-center justify-between">
                 <span className="text-sm">Neural Core v2.4</span>
                 <Badge>Operational</Badge>
               </div>
               <div className="mt-4 text-xs text-slate-500">
                 Latency: <span className="text-slate-900 font-medium">12ms</span>
               </div>
             </UICardContent>
          </UICard>

          <UICard>
             <UICardHeader>
               <UICardTitle className="text-sm flex items-center gap-2">
                 <ShieldAlert size={16} /> Safety Overrides
               </UICardTitle>
             </UICardHeader>
             <UICardContent>
                <div className="space-y-3">
                   <div className="flex items-center justify-between text-sm">
                     <span>Temp. Threshold</span>
                     <span className="font-mono">85°C</span>
                   </div>
                   <div className="flex items-center justify-between text-sm">
                     <span>Auto-Shutdown</span>
                     <Badge variant="outline">Enabled</Badge>
                   </div>
                </div>
             </UICardContent>
          </UICard>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UICard>
          <UICardHeader>
            <UICardTitle>AI Recommendations</UICardTitle>
          </UICardHeader>
          <UICardContent>
             <ul className="space-y-4">
               {[
                 { title: 'Inventory Optimization', desc: 'Reduce raw cocoa stock by 15% to improve liquidity.', impact: 'High' },
                 { title: 'Batch Scheduling', desc: 'Shift production of Dark Velvet to Night Shift for energy savings.', impact: 'Medium' }
               ].map((item, i) => (
                 <li key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-white hover:shadow-sm transition-shadow">
                    <div className="p-2 bg-primary/5 text-primary rounded">
                       <LineChart size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                      <Badge className="mt-2" variant="outline">{item.impact} Impact</Badge>
                    </div>
                 </li>
               ))}
             </ul>
          </UICardContent>
        </UICard>

        <UICard>
           <UICardHeader>
             <UICardTitle>Recent AI Interventions</UICardTitle>
           </UICardHeader>
           <UICardContent>
              <div className="space-y-4">
                 {[
                   { time: '10 min ago', action: 'Auto-balanced humidity in Warehouse B', status: 'Success' },
                   { time: '1 hour ago', action: 'Recalibrated Molding Line #4 sensors', status: 'Success' },
                   { time: '3 hours ago', action: 'Adjusted Milk Hazelnut recipe viscosity', status: 'Success' }
                 ].map((log, i) => (
                   <div key={i} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-xs text-slate-400">{log.time}</p>
                      </div>
                      <Badge variant="outline" className="text-green-600 bg-green-50 border-green-100">{log.status}</Badge>
                   </div>
                 ))}
              </div>
           </UICardContent>
        </UICard>
      </div>
    </div>
  );
}
