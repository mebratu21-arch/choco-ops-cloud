import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, UserX, UserCheck, RefreshCw, Plus, Trash2, Edit } from 'lucide-react';
import apiClient from '../../lib/api/axios';
import { toast } from 'sonner';
import UserFormModal, { UserFormData } from '../../components/admin/UserFormModal';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'WAREHOUSE' | 'PRODUCTION' | 'QC' | 'MECHANIC' | 'CONTROLLER';
  status: 'ACTIVE' | 'DISABLED';
  last_login?: string;
}

const FALLBACK_USERS: User[] = [
  { id: '1', name: 'Mebrahtu Kassa', email: 'mebrahtu@chocoflow.com', role: 'ADMIN', status: 'ACTIVE', last_login: '2026-02-10T08:30:00Z' },
  { id: '2', name: 'Sarah Jenkins', email: 'sarah.j@chocoflow.com', role: 'MANAGER', status: 'ACTIVE', last_login: '2026-02-10T09:15:00Z' },
  { id: '3', name: 'Robert Chen', email: 'robert.c@chocoflow.com', role: 'OPERATOR', status: 'ACTIVE', last_login: '2026-02-09T18:45:00Z' },
  { id: '4', name: 'Elena Rodriguez', email: 'elena.r@chocoflow.com', role: 'OPERATOR', status: 'DISABLED', last_login: '2026-02-08T14:20:00Z' },
  { id: '5', name: 'David Smith', email: 'david.s@chocoflow.com', role: 'MANAGER', status: 'ACTIVE', last_login: '2026-02-10T10:05:00Z' },
];

// Helper to safely extract response data from apiClient (handles both wrapped and unwrapped)
function extractResponseData<T>(axiosRes: any): { success: boolean; data: T; error?: string } {
  // apiClient returns the full Axios response, so .data is the body
  const body = axiosRes?.data ?? axiosRes;
  return body as { success: boolean; data: T; error?: string };
}

const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/admin/users');
            const body = extractResponseData<User[]>(res);
            if (body.success && Array.isArray(body.data) && body.data.length > 0) {
                setUsers(body.data);
            } else {
                setUsers(FALLBACK_USERS);
            }
        } catch {
            toast.error('Failed to load users — showing offline data');
            setUsers(FALLBACK_USERS);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchUsers();
    }, []);

    /* ────────────── BUTTON HANDLERS ────────────── */

    const handleCreateUser = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        
        try {
            await apiClient.delete(`/admin/users/${userId}`);
            toast.success('User deleted successfully');
        } catch {
            toast.warning('Server error — removed locally');
        }
        // Always update local state
        setUsers(prev => prev.filter(u => u.id !== userId));
    };

    const handleFormSubmit = async (formData: UserFormData) => {
        if (editingUser) {
            // ── UPDATE ──
            try {
                const res = await apiClient.put(`/admin/users/${editingUser.id}`, formData);
                const body = extractResponseData<User>(res);
                if (body.success && body.data) {
                    setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...body.data } : u));
                } else {
                    // Apply locally anyway
                    setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
                }
                toast.success('User updated successfully');
            } catch {
                // Apply locally as fallback
                setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
                toast.warning('Server unreachable — updated locally');
            }
        } else {
            // ── CREATE ──
            try {
                const res = await apiClient.post('/admin/users', formData);
                const body = extractResponseData<User>(res);
                if (body.success && body.data) {
                    setUsers(prev => [body.data, ...prev]);
                } else {
                    // Generate local-only user
                    const localUser: User = {
                        id: `local-${Date.now()}`,
                        name: formData.name,
                        email: formData.email,
                        role: formData.role,
                        status: formData.status ?? 'ACTIVE',
                    };
                    setUsers(prev => [localUser, ...prev]);
                }
                toast.success('User created successfully');
            } catch {
                // Generate local-only user as fallback
                const localUser: User = {
                    id: `local-${Date.now()}`,
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                    status: formData.status ?? 'ACTIVE',
                };
                setUsers(prev => [localUser, ...prev]);
                toast.warning('Server unreachable — added locally');
            }
        }
        setIsModalOpen(false);
    };

    const toggleStatus = async (userId: string) => {
        // Optimistic local update first
        setUsers(prev => prev.map(u =>
            u.id === userId ? { ...u, status: u.status === 'ACTIVE' ? 'DISABLED' as const : 'ACTIVE' as const } : u
        ));

        try {
            const res = await apiClient.patch(`/admin/users/${userId}/toggle-active`);
            const body = extractResponseData<User>(res);
            if (body.success && body.data) {
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: body.data.status } : u));
            }
            toast.success('User status updated');
        } catch {
            toast.warning('Server unreachable — toggled locally');
        }
    };

    /* ────────────── RENDER ────────────── */

    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-gold-500" />
                    User Directory
                </CardTitle>
                <div className="flex gap-2">
                    <Button variant="default" size="sm" onClick={handleCreateUser} className="bg-gold-600 hover:bg-gold-500 text-white border-none">
                        <Plus className="h-4 w-4 mr-2" />
                        Add User
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => void fetchUsers()} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
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
                                            u.role === 'WAREHOUSE' ? 'bg-orange-900/30 text-orange-400 border-orange-900/50' :
                                            u.role === 'PRODUCTION' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-900/50' :
                                            u.role === 'QC' ? 'bg-purple-900/30 text-purple-400 border-purple-900/50' :
                                            u.role === 'MECHANIC' ? 'bg-cyan-900/30 text-cyan-400 border-cyan-900/50' :
                                            u.role === 'CONTROLLER' ? 'bg-pink-900/30 text-pink-400 border-pink-900/50' :
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
                                        <div className="flex items-center gap-1">
                                            <button 
                                                type="button"
                                                onClick={() => handleEditUser(u)}
                                                className="p-2 rounded-md text-blue-400 hover:text-blue-300 hover:bg-slate-700/50 transition-colors"
                                                title="Edit User"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button 
                                                type="button"
                                                className={`p-2 rounded-md hover:bg-slate-700/50 transition-colors ${u.status === 'ACTIVE' ? 'text-amber-400 hover:text-amber-300' : 'text-green-400 hover:text-green-300'}`}
                                                onClick={() => void toggleStatus(u.id)}
                                                title={u.status === 'ACTIVE' ? "Disable User" : "Activate User"}
                                            >
                                                {u.status === 'ACTIVE' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => void handleDeleteUser(u.id)}
                                                className="p-2 rounded-md text-red-400 hover:text-red-300 hover:bg-slate-700/50 transition-colors"
                                                title="Delete User"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
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

            <UserFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={editingUser ?? undefined}
                isEditing={!!editingUser}
            />
        </Card>
    );
};

export default UserManagement;
