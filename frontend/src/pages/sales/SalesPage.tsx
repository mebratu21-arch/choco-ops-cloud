import React, { useEffect, useState } from 'react';
import { salesService } from '../../services/salesService';
import { Order } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ShoppingBag } from 'lucide-react';

const SalesPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
             const data = await salesService.getOnlineOrders();
             setOrders(data);
             setLoading(false);
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
                                {orders.map(order => (
                                    <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                                                <ShoppingBag className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{order.customerName}</p>
                                                <p className="text-sm text-muted-foreground">${order.totalAmount} • {order.status}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {order.status === 'PENDING' && (
                                                <>
                                                    <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">Accept</Button>
                                                </>
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
