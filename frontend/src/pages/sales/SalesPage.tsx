import { useEffect, useState } from 'react';
import { salesService } from '../../services/salesService';
import { OnlineOrder } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ShoppingBag } from 'lucide-react';

const SalesPage = () => {
    const [orders, setOrders] = useState<OnlineOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await salesService.getAllOrders();
                setOrders(data);
            } catch (error) {
                console.error('Failed to load orders:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Sales Dashboard</h1>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Online Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <p>Loading...</p> : (
                            <div className="space-y-4">
                                {orders.length === 0 ? (
                                    <p className="text-muted-foreground">No orders found</p>
                                ) : orders.map(order => (
                                    <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                                                <ShoppingBag className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{order.customer_name || order.customer_email}</p>
                                                <p className="text-sm text-muted-foreground">${order.total_amount} • {order.status}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {order.status === 'PENDING' && (
                                                <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">Accept</Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Create Employee Sale</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-40 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                            POS Interface Placeholder
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SalesPage;
