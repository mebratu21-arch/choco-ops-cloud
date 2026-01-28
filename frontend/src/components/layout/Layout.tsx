import PurpleSidebar from './PurpleSidebar';
import PurpleHeader from './PurpleHeader';
import AIChatWidget from '../AIChatWidget';
import { useAuthStore } from '../../store/authStore';
import { Navigate, Outlet } from 'react-router-dom';

const Layout = () => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated());

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-[#f2edf3]">
            <PurpleSidebar />
            <PurpleHeader />
            <main className="ml-64 pt-[70px] p-8">
                <Outlet />
            </main>
            <AIChatWidget />
        </div>
    );
};

export default Layout;
