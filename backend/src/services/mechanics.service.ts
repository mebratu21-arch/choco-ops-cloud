import { db } from '../config/database.js';
import { logger } from '../config/logger.js';
import { MechanicsRepository } from '../repositories/mechanics.repository.js';
import { MachineFixInput } from '../types/mechanics.types.js';

export class MechanicsService {
  static async logFix(input: MachineFixInput, userId: string) {
    return db.transaction(async (trx) => {
      await MechanicsRepository.logFix({
        user_id: userId,
        action: 'MACHINE_FIX',
        resource: 'machines',
        resource_id: input.batch_id || null, // Ensure null if undefined
        new_values: JSON.stringify({ description: input.description, notes: input.notes }),
      }, trx);

      logger.info('Machine fix logged', { userId });

      return { success: true };
    });
  }
}
