import { config } from './src/config/environment';

module.exports = {
  development: {
    client: 'pg',
    connection: config.DATABASE_URL,
    migrations: {
      directory: './migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './seeds',
    },
  },
  production: {
    client: 'pg',
    connection: config.DATABASE_URL,
    pool: { min: 2, max: 10 },
    migrations: {
      directory: './migrations',
      extension: 'ts',
    },
  },
};
