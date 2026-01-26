import { db } from '../config/database.js';
import { logger } from '../config/logger.js';
import { MechanicsRepository } from '../repositories/mechanics.repository.js';
import { MachineFixInput } from '../types/mechanics.types.js';
import { Audit } from '../utils/audit.js';

export class MechanicsService {
  static async logFix(input: any, userId?: string) {
    return db.transaction(async (trx) => {
      const fix = await MechanicsRepository.logFix({
        machine_id: input.machine_id || input.batch_id || 'UNKNOWN',
        description: input.description,
        fixed_by: userId || 'SYSTEM',
        // notes: input.notes // added notes to repo if needed
      }, trx);

      // Audit log
      await Audit.logAction(userId, 'LOG_MACHINE_FIX', 'mechanics', { 
          fixId: fix.id, 
          machineId: fix.equipment_id,
          description: input.description 
      }, trx);

      logger.info('Machine fix logged', { userId, fixId: fix.id });
      return { success: true, data: fix };
    });
  }
}
