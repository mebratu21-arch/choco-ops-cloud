import { describe, it, expect, vi, beforeEach } from 'vitest';
import { qcService } from '../qcService';
import { db } from '../../config/database';

vi.mock('../../config/database', () => ({
  db: vi.fn(),
}));

describe('QCService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

  describe('createQCCheck', () => {
    it('should log inspection and defects', async () => {
      const trx = {
        insert: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: 'check1', result: 'approved' }]),
        where: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis()
      } as any;

      (db.transaction as any) = vi.fn((callback) => callback(trx));

      const checkData = { batch_id: 'b1', result: 'approved' as const };
      const defects = [{ defect_type: 'visual', severity: 'minor' as const, quantity: 1 }];

      const result = await qcService.createQCCheck(checkData, defects);

      expect(trx.insert).toHaveBeenCalledTimes(2); // One for check, one for defects
      expect(result).toHaveProperty('id', 'check1');
    });

    it('should auto-fail batch if rejected', async () => {
        const trx = {
            insert: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue([{ id: 'check2', result: 'rejected' }]),
            where: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis() // Batch status update
        } as any;
  
        (db.transaction as any) = vi.fn((callback) => callback(trx));
  
        const checkData = { batch_id: 'b2', result: 'rejected' as const };
  
        await qcService.createQCCheck(checkData);
  
        expect(trx.update).toHaveBeenCalledWith({ status: 'failed' });
    });
  });
});
