import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/presentation/components/ui/Table';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Settings, PenTool, Wrench } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';

const mockLogs = [
  { id: 'MT-101', machine: 'Conche Machine #3', issue: 'Belt Slippage', severity: 'Medium', status: 'Fixed', technician: 'Avi Mizrahi' },
  { id: 'MT-102', machine: 'Cooling Tunnel A', issue: 'Temperature Fluctuation', severity: 'High', status: 'In Progress', technician: 'Dan Regev' },
  { id: 'MT-103', machine: 'Molding Line #1', issue: 'Sensor Calibration', severity: 'Low', status: 'Scheduled', technician: 'Avi Mizrahi' },
];

export default function MechanicsLogPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mechanics Logs</h1>
          <p className="text-slate-500">Track machine maintenance and factory floor repairs.</p>
        </div>
        <Button className="flex items-center gap-2">
          <Wrench size={16} /> Report Issue
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-full">
               <PenTool size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Critical Repairs</p>
              <p className="text-2xl font-bold">3</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
             <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
               <Settings size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Operational Machines</p>
              <p className="text-2xl font-bold">12 / 15</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-full">
               <Wrench size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pending Maintenance</p>
              <p className="text-2xl font-bold">8</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Log ID</TableHead>
                <TableHead>Machine</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Technician</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.id}</TableCell>
                  <TableCell>{log.machine}</TableCell>
                  <TableCell>{log.issue}</TableCell>
                  <TableCell>
                    <Badge variant={log.severity === 'High' ? 'destructive' : 'secondary'}>
                      {log.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.status}</TableCell>
                  <TableCell>{log.technician}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
