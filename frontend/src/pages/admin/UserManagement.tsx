import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, UserX, UserCheck, RefreshCw } from 'lucide-react';
import apiClient from '../../lib/api/axios';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'DISABLED';
  last_login?: string;
}

const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get('/admin/users');
            if (data.success) {
                setUsers(data.data);
            }
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleStatus = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
        try {
            // Mock API call since /api/admin/users/:id/status might not exist yet
            // In a real scenario: await apiClient.patch(`/admin/users/${userId}/status`, { status: newStatus });
            
            setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus as any } : u));
            toast.success(`User ${newStatus === 'ACTIVE' ? 'activated' : 'disabled'}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-gold-500" />
                    User Directory
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={fetchUsers} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-950/50">
                            <tr>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">
                                        <div>{u.name}</div>
                                        <div className="text-xs text-slate-500">{u.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                                            u.role === 'ADMIN' ? 'bg-red-900/30 text-red-500 border-red-900/50' : 
                                            u.role === 'MANAGER' ? 'bg-gold-900/30 text-gold-500 border-gold-900/50' : 
                                            'bg-blue-900/30 text-blue-500 border-blue-900/50'
                                        }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2 w-2 rounded-full ${u.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></div>
                                            {u.status}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            className={`${u.status === 'ACTIVE' ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}
                                            onClick={() => toggleStatus(u.id, u.status)}
                                        >
                                            {u.status === 'ACTIVE' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-slate-500">No users found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};

export default UserManagement;
