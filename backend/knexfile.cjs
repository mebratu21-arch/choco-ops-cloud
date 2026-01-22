// ========================================================
// CHOCOOPS CLOUD – KNEX CONFIGURATION (CommonJS)
// Compatible with tsx and knex CLI
// ========================================================

require('dotenv').config();
require('ts-node/register');

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './migrations',
      extension: 'cjs',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './seeds',
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
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 60000,
      idleTimeoutMillis: 30000,
      propagateCreateError: false
    },
    migrations: {
      directory: './migrations',
      extension: 'cjs',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './seeds'
    },
    acquireConnectionTimeout: 60000
  }
};
