// ========================================================
// CHOCOOPS CLOUD – DATABASE CONNECTION
// Production-Grade PostgreSQL Setup with Knex
// ========================================================

import knex, { Knex } from 'knex';
import { config, isProduction } from './environment.js';

/**
 * Knex database instance
 * Configured for PostgreSQL with environment-aware pooling
 */
export const db: Knex = knex({
  client: 'pg',
  connection: config.DATABASE_URL,
  pool: isProduction
    ? {
        min: 2,
        max: 10,
        acquireTimeoutMillis: 60000,
        idleTimeoutMillis: 30000,
        propagateCreateError: false,
      }
    : {
        min: 0,
        max: 7,
        acquireTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
      },
  searchPath: ['public'],
  asyncStackTraces: !isProduction, // Enable in development for better debugging
  debug: false,
});

/**
 * Test database connection
 * Verifies PostgreSQL connectivity and permissions
 * 
 * @throws Error if connection fails
 */
export async function testConnection(): Promise<void> {
  try {
    console.log('🔌 Testing database connection...');
    
    // Test basic connectivity
    await db.raw('SELECT 1 as connection_test');
    
    // Check PostgreSQL version
    const result = await db.raw('SELECT version()');
    const version = result.rows[0].version;
    
    console.log('✅ Database connection successful');
    console.log(`📊 PostgreSQL Version: ${version.split(',')[0]}`);
    
    // Check if migrations table exists
    const hasMigrations = await db.schema.hasTable('knex_migrations');
    if (hasMigrations) {
      const migrations = await db('knex_migrations')
        .select('name')
        .orderBy('id', 'desc')
        .limit(1);
      
      if (migrations.length > 0) {
        console.log(`🔄 Last migration: ${migrations[0].name}`);
      }
    } else {
      console.log('⚠️  No migrations found. Run: npm run migrate:latest');
    }
  } catch (error) {
    console.error('❌ Database connection failed:');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
      
      // Provide helpful debugging hints
      if (error.message.includes('ECONNREFUSED')) {
        console.error('\n💡 Troubleshooting:');
        console.error('   • Is PostgreSQL running?');
        console.error('   • Check DATABASE_URL in .env file');
        console.error('   • Verify host and port are correct');
      } else if (error.message.includes('authentication failed')) {
        console.error('\n💡 Troubleshooting:');
        console.error('   • Check database username and password');
        console.error('   • Verify user has necessary permissions');
      } else if (error.message.includes('database') && error.message.includes('does not exist')) {
        console.error('\n💡 Troubleshooting:');
        console.error('   • Create the database first');
        console.error('   • Run: createdb chocoops_cloud');
      }
    }
    
    process.exit(1);
  }
}

/**
 * Gracefully close database connection
 * Call this during application shutdown
 */
export async function closeConnection(): Promise<void> {
  try {
    await db.destroy();
    console.log('🔌 Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
}

/**
 * Get database health status
 * Useful for health check endpoints
 */
export async function getHealthStatus(): Promise<{
  healthy: boolean;
  message: string;
  responseTime?: number;
}> {
  const startTime = Date.now();
  
  try {
    await db.raw('SELECT 1');
    const responseTime = Date.now() - startTime;
    
    return {
      healthy: true,
      message: 'Database is healthy',
      responseTime,
    };
  } catch (error) {
    return {
      healthy: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// If this file is run directly, test the connection
if (import.meta.url === `file://${process.argv[1]}`) {
  testConnection()
    .then(() => closeConnection())
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
