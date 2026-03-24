import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/presentation/components/ui/Table';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';

const mockQC = [
  { id: 'QC-901', batch: 'BT-442', metric: 'Viscosity', result: 'Pass', score: '98%', inspector: 'David Levi' },
  { id: 'QC-902', batch: 'BT-443', metric: 'Fat Content', result: 'Pass', score: '94%', inspector: 'Sarah Cohen' },
  { id: 'QC-903', batch: 'BT-444', metric: 'Temper Stability', result: 'Fail', score: '62%', inspector: 'David Levi' },
  { id: 'QC-904', batch: 'BT-445', metric: 'Particle Size', result: 'Pass', score: '99%', inspector: 'Yossi Bar' },
];

export default function QualityControlPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Quality Control</h1>
          <p className="text-slate-500">Ensure every chocolate batch meets premium standards.</p>
        </div>
        <Button className="flex items-center gap-2 bg-slate-900">
          <ShieldCheck size={16} /> Log New Inspection
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">Passing Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">94.2%</div>
            <p className="text-xs text-slate-400 mt-1">+1.4% from last week</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">Critical Alerts</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-3xl font-bold">2</div>
            <AlertCircle className="h-8 w-8 text-red-500 animate-pulse" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Inspections</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Inspection ID</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Metric</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Inspector</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockQC.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.id}</TableCell>
                  <TableCell className="font-mono">{log.batch}</TableCell>
                  <TableCell>{log.metric}</TableCell>
                  <TableCell>
                    <Badge variant={log.result === 'Pass' ? 'default' : 'destructive'}>
                      {log.result}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.score}</TableCell>
                  <TableCell>{log.inspector}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
