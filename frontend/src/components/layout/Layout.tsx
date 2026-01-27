import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import AIChatWidget from '../AIChatWidget';
import { useAuthStore } from '../../store/authStore';
import { Navigate, Outlet } from 'react-router-dom';

const Layout = () => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated());

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            <Header />
            <main className="ml-64 p-8">
                <Outlet />
            </main>
            <AIChatWidget />
        </div>
    );
};

export default Layout;
