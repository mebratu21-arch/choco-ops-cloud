import { useState } from 'react';
import { 
    CheckCircle2, 
    AlertTriangle, 
    Info, 
    Clock,
    Trash2,
    Check,
    X,
    BellOff
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'warning' | 'success' | 'info';
    time: string;
    read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
    {
        id: 1,
        title: 'Low Stock Alert: Cocoa Butter',
        message: 'Inventory level for Cocoa Butter has fallen below 50kg.',
        type: 'warning',
        time: '10 mins ago',
        read: false
    },
    {
        id: 2,
        title: 'Batch Completed',
        message: 'Production Batch B-2024-089 has been successfully completed.',
        type: 'success',
        time: '1 hour ago',
        read: false
    },
    {
        id: 3,
        title: 'New User Registration',
        message: 'New operator "Sarah Connor" has requested access.',
        type: 'info',
        time: '3 hours ago',
        read: true
    },
    {
        id: 4,
        title: 'System Maintenance',
        message: 'Scheduled maintenance will occur tonight at 02:00 AM.',
        type: 'warning',
        time: 'Yesterday',
        read: true
    },
    {
        id: 5,
        title: 'Quality Check Passed',
        message: 'Batch B-2024-087 passed all quality control inspections.',
        type: 'success',
        time: '2 days ago',
        read: true
    },
    {
        id: 6,
        title: 'Supplier Delivery Arrived',
        message: 'Ghana Premium Cocoa shipment arrived at Dock B.',
        type: 'info',
        time: '3 days ago',
        read: true
    }
];

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2500);
    };

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        showToast('All notifications marked as read');
    };

    const clearAll = () => {
        setNotifications([]);
        showToast('All notifications cleared');
    };

    const dismiss = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        showToast('Notification dismissed');
    };

    const markRead = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="space-y-6 max-w-3xl mx-auto animate-fade-in pb-12">
            {/* Toast */}
            {toast && (
                <div className="fixed top-6 right-6 z-50 bg-cocoa-800 text-white px-5 py-3 rounded-xl shadow-2xl animate-in slide-in-from-top-2 duration-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    {toast}
                </div>
            )}

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-cocoa-900">
                        Notifications {unreadCount > 0 && <span className="text-base font-normal text-amber-600 ml-2">({unreadCount} unread)</span>}
                    </h1>
                    <p className="text-slate-500">Stay updated with system alerts and activities</p>
                </div>
                {notifications.length > 0 && (
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2" onClick={markAllRead} disabled={unreadCount === 0}>
                            <Check className="w-4 h-4" /> Mark all read
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-2" onClick={clearAll}>
                            <Trash2 className="w-4 h-4" /> Clear all
                        </Button>
                    </div>
                )}
            </div>

            <div className="space-y-3">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <BellOff className="w-16 h-16 mb-4 opacity-40" />
                        <p className="text-lg font-medium">No notifications</p>
                        <p className="text-sm">You're all caught up!</p>
                    </div>
                ) : notifications.map((notif) => (
                    <Card 
                        key={notif.id} 
                        className={`border-l-4 transition-all hover:shadow-md cursor-pointer group ${
                            notif.read ? 'bg-white border-l-slate-200' : 'bg-blue-50/30 border-l-gold-500'
                        }`}
                        onClick={() => markRead(notif.id)}
                    >
                        <CardContent className="p-4 flex gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                notif.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                                notif.type === 'success' ? 'bg-green-100 text-green-600' :
                                'bg-blue-100 text-blue-600'
                            }`}>
                                {notif.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
                                 notif.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
                                 <Info className="w-5 h-5" />}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className={`font-semibold ${notif.read ? 'text-slate-700' : 'text-cocoa-900'}`}>
                                        {!notif.read && <span className="inline-block w-2 h-2 bg-amber-500 rounded-full mr-2 align-middle" />}
                                        {notif.title}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {notif.time}
                                        </span>
                                        <button
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"
                                            onClick={(e) => { e.stopPropagation(); dismiss(notif.id); }}
                                            title="Dismiss"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 mt-1">{notif.message}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default NotificationsPage;
