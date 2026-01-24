import { db } from '../config/database.js'; // Added .js extension for imports

export class MechanicsRepository {
  static async logFix(data: any, trx: any) {
    await trx('audit_logs').insert(data);
  }
}
