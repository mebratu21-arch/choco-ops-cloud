import { env } from '../src/config/env.js';

console.log('Knexfile: env loaded');
console.log('DATABASE_URL:', env.DATABASE_URL ? 'PRESENT' : 'MISSING');

export default {
  development: {
    client: 'pg',
    connection: env.DATABASE_URL,
    migrations: {
      directory: '../src/db/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: '../src/db/seeds',
    },
  },
  production: {
    client: 'pg',
    connection: env.DATABASE_URL,
    pool: { min: 2, max: 10 },
    migrations: {
      directory: '../src/db/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: '../src/db/seeds',
    },
  },
};
