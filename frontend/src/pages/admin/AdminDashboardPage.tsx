import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import apiClient from '../../lib/api/axios';
import { 
  Users, 
  Activity, 
  Server, 
  DollarSign, 
  Database, 
  UserPlus
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import UserManagement from './UserManagement';

interface SystemStats {
    users: { total: number; active: number; new_this_week: number };
    system: { health: string; uptime: string; version: string };
    revenue: { daily: number; monthly: number; growth: string };
    db: { status: string; latency: string };
}

const AdminDashboardPage = () => {
    const user = useAuthStore(state => state.user);
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsRes = await apiClient.get('/admin/stats');
                if (statsRes.data.success) setStats(statsRes.data.data);
            } catch (error) {
                console.error('Failed to fetch admin data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-950 text-gold-500">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Command Center</h1>
                    <p className="text-slate-400">Welcome back, Commander {user?.name}</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="border-gold-500 text-gold-500 hover:bg-gold-500/10" onClick={() => console.log('View Logs')}>
                        <Server className="h-4 w-4 mr-2" />
                        System Logs
                    </Button>
                    <Button className="bg-gold-600 hover:bg-gold-700 text-white" onClick={() => console.log('Add User')}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add User
                    </Button>
                </div>
            </header>

            {/* WOW FACTOR: STATUS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats?.users.total}</div>
                        <p className="text-xs text-slate-400">
                            <span className="text-green-500">+{stats?.users.new_this_week}</span> new this week
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">System Health</CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">{stats?.system.health}</div>
                        <p className="text-xs text-slate-400">Uptime: {stats?.system.uptime}</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Revenue (Est)</CardTitle>
                        <DollarSign className="h-4 w-4 text-gold-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">${stats?.revenue.monthly.toLocaleString()}</div>
                        <p className="text-xs text-slate-400">
                            <span className="text-green-500">{stats?.revenue.growth}</span> from last month
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Database</CardTitle>
                        <Database className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats?.db.status}</div>
                        <p className="text-xs text-slate-400">Latency: {stats?.db.latency}</p>
                    </CardContent>
                </Card>
            </div>

            {/* USER MANAGEMENT TABLE */}
            <UserManagement />
        </div>
    );
};

export default AdminDashboardPage;
