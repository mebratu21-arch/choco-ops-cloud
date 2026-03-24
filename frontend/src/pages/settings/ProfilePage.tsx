import { User, Mail, Shield, Globe, Camera } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

const ProfilePage = () => {
    const { useCurrentUser } = useAuth();
    const { data: user } = useCurrentUser();

    return (
        <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold font-serif text-cocoa-900">My Profile</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="md:col-span-1 border-cocoa-100 shadow-sm">
                    <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gold-100 to-cocoa-100 flex items-center justify-center border-4 border-white shadow-lg">
                                <span className="text-4xl font-bold text-cocoa-800">
                                    {user?.full_name?.charAt(0) ?? 'U'}
                                </span>
                            </div>
                            <button className="absolute bottom-0 right-0 p-2 bg-cocoa-600 text-white rounded-full hover:bg-cocoa-700 transition-colors shadow-md">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-cocoa-900">{user?.full_name}</h2>
                            <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">{user?.role}</p>
                        </div>
                        <div className="w-full pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between text-sm py-2">
                                <span className="text-slate-500">Status</span>
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Active</span>
                            </div>
                            <div className="flex items-center justify-between text-sm py-2">
                                <span className="text-slate-500">Member Since</span>
                                <span className="text-cocoa-900 font-medium">Jan 2024</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Settings Form */}
                <Card className="md:col-span-2 border-cocoa-100 shadow-sm">
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input defaultValue={user?.full_name} className="pl-9" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input defaultValue={user?.email} className="pl-9" disabled />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Role</label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input defaultValue={user?.role} className="pl-9 capitalize" disabled />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Language</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-9">
                                        <option>English</option>
                                        <option>Spanish</option>
                                        <option>French</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-4 flex justify-end gap-2">
                            <Button variant="outline">Cancel</Button>
                            <Button className="bg-cocoa-600 hover:bg-cocoa-700 text-white">Save Changes</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ProfilePage;
