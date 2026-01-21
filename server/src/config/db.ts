import knex from 'knex';
import config from '../../knexfile';
import dotenv from 'dotenv';

dotenv.config();

const environment = process.env.NODE_ENV || 'development';
const connectionConfig = config[environment];

const db = knex(connectionConfig);

export default db;
