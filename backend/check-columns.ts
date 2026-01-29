import dotenv from 'dotenv';
import knex from 'knex';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

const db = knex({ client: 'pg', connection: process.env.DATABASE_URL });

async function check() {
  try {
    const userCols = await db.raw("SELECT column_name FROM information_schema.columns WHERE table_name='users'");
    console.log('USERS columns:', userCols.rows.map((r: any) => r.column_name).sort());

    const auditCols = await db.raw("SELECT column_name FROM information_schema.columns WHERE table_name='audit_logs'");
    console.log('AUDIT columns:', auditCols.rows.map((r: any) => r.column_name).sort());

    const qcCols = await db.raw("SELECT column_name FROM information_schema.columns WHERE table_name='quality_controls'");
    console.log('QUALITY_CONTROLS:', qcCols.rows.map((r: any) => r.column_name).sort());

    const maintCols = await db.raw("SELECT column_name FROM information_schema.columns WHERE table_name='maintenance_logs'");
    console.log('MAINTENANCE_LOGS:', maintCols.rows.map((r: any) => r.column_name).sort());

    const equipCols = await db.raw("SELECT column_name FROM information_schema.columns WHERE table_name='equipment'");
    console.log('EQUIPMENT:', equipCols.rows.map((r: any) => r.column_name).sort());


  } catch (e) {
    console.error(e);
  } finally {
    db.destroy();
  }
}
check();
