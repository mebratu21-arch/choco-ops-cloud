
import db from './index';

export const initializeDatabase = async () => {
    try {
        console.log('🔄 Running Database Migrations...');
        await db.migrate.latest();
        console.log('✅ Database Migrations Completed.');
        return { success: true, message: 'Database initialized successfully' };
    } catch (error: any) {
        // If tables already exist, that's fine - database is already set up
        if (error.code === '42P07') {
            console.log('✅ Database already initialized (tables exist).');
            return { success: true, message: 'Database already initialized' };
        }
        console.error('❌ Database Migration Failed:', error);
        throw error;
    }
};
