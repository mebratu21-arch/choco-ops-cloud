import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/presentation/components/ui/Table';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { ShoppingCart, Filter } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';

const mockOrders = [
  { id: 'ORD-101', customer: 'Elite Boutique Tel Aviv', amount: '₪12,400', status: 'Pending', date: '2024-03-20' },
  { id: 'ORD-102', customer: 'Chocolate Haven Haifa', amount: '₪5,200', status: 'Processing', date: '2024-03-19' },
  { id: 'ORD-103', customer: 'Zuchinni Sweets', amount: '₪8,900', status: 'Shipped', date: '2024-03-18' },
  { id: 'ORD-104', customer: 'Jerusalem Candy Co.', amount: '₪15,000', status: 'Delivered', date: '2024-03-15' },
];

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Online Orders</h1>
          <p className="text-slate-500">Monitor and fulfill wholesale and B2B orders.</p>
        </div>
        <Button className="flex items-center gap-2">
          <Filter size={16} /> Filter Orders
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: 'Total Orders', value: '142', sub: '+12 from yesterday' },
          { label: 'Pending', value: '28', sub: 'Action required' },
          { label: 'Revenue', value: '₪245K', sub: 'This month' },
          { label: 'Shipped', value: '98', sub: 'On track' },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.amount}</TableCell>
                  <TableCell>
                    <Badge variant={
                      order.status === 'Pending' ? 'destructive' : 
                      order.status === 'Shipped' ? 'default' : 'secondary'
                    }>
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
