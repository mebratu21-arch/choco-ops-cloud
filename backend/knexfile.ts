// ========================================================
// CHOCOOPS CLOUD – KNEX CONFIGURATION
// January 2026 – Production-Grade Database Setup
// ========================================================

import { config } from './src/config/environment.js';
import type { Knex } from 'knex';

const knexConfig: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: config.DATABASE_URL,
    migrations: {
      directory: './migrations',
      extension: 'ts',
      tableName: 'knex_migrations',
      loadExtensions: ['.ts']
    },
    seeds: {
      directory: './seeds',
      loadExtensions: ['.ts']
    },
    pool: {
      min: 0,
      max: 7,
      acquireTimeoutMillis: 30000,
      idleTimeoutMillis: 30000
    },
    debug: false
  },

  production: {
    client: 'pg',
    connection: config.DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 60000,
      idleTimeoutMillis: 30000,
      propagateCreateError: false
    },
    migrations: {
      directory: './migrations',
      extension: 'ts',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './seeds'
    },
    acquireConnectionTimeout: 60000
  }
};

export default knexConfig;
