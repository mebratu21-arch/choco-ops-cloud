import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2
} from 'lucide-react';

// Mock Orders
const ORDERS = [
    {
        id: 'ORD-001',
        date: '2023-10-25',
        total: 45.00,
        status: 'DELIVERED',
        items: ['Artisan Dark Chocolate Truffles (x2)', 'Ruby Chocolate Bar (x1)']
    },
    {
        id: 'ORD-002',
        date: '2023-11-02',
        total: 22.00,
        status: 'READY_FOR_PICKUP',
        items: ['Gold Dust Pralines (x1)']
    },
    {
        id: 'ORD-003',
        date: '2023-11-10',
        total: 12.50,
        status: 'PROCESSING',
        items: ['Hazelnut Spread Classic (x1)']
    }
];

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'DELIVERED':
            return <Badge className="bg-green-100 text-green-700 hover:bg-green-200"><CheckCircle2 className="h-3 w-3 mr-1" /> Delivered</Badge>;
        case 'READY_FOR_PICKUP':
            return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200"><ShoppingBag className="h-3 w-3 mr-1" /> Ready at Depot</Badge>;
        case 'PROCESSING':
            return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200"><Clock className="h-3 w-3 mr-1" /> Processing</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

const Orders = () => {
    return (
        <div className="space-y-6 pb-12 animate-fade-in">
             <div>
                <h1 className="text-3xl font-bold tracking-tight font-serif text-cocoa-900">Your Orders</h1>
                <p className="text-muted-foreground">Track your staff purchases and gifts.</p>
            </div>

            <div className="grid gap-4">
                {ORDERS.map((order) => (
                    <Card key={order.id} className="border-cocoa-100 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-bold text-cocoa-900">{order.id}</h3>
                                        {getStatusBadge(order.status)}
                                    </div>
                                    <p className="text-sm text-slate-500">Placed on {order.date}</p>
                                </div>
                                
                                <div className="flex-1 md:text-right md:px-8">
                                    <p className="text-sm font-medium text-slate-700 mb-1">Items:</p>
                                    <ul className="text-sm text-slate-500">
                                        {order.items.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="text-right min-w-[100px]">
                                    <p className="text-sm text-slate-500">Total</p>
                                    <p className="text-2xl font-bold text-cocoa-900">${order.total.toFixed(2)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Orders;
