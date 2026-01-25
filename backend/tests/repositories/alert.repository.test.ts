import { db, disconnectDB } from '../../src/config/database.js';
import { AlertRepository } from '../../src/repositories/alert.repository.js';
import { UserRepository } from '../../src/repositories/user.repository.js';

describe('AlertRepository', () => {
  let trx: any;

  beforeEach(async () => {
    trx = await db.transaction();
  });

  afterEach(async () => {
    await trx.rollback();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('create', () => {
    it('should create low stock alert', async () => {
      const user = await UserRepository.create({
        email: 'alert@test.com', name: 'Alert User', role: 'MANAGER', password_hash: 'hash',
        is_active: true
      }, trx);

      const input = {
        user_id: user.id,
        type: 'LOW_STOCK',
        title: 'Low Cocoa Stock',
        message: 'Only 5kg left',
        priority: 'HIGH',
      };

      const [alert] = await AlertRepository.create(input, trx);

      expect(alert.type).toBe('LOW_STOCK');
      expect(alert.priority).toBe('HIGH');
      expect(alert.status).toBe('PENDING');
    });
  });

  describe('findByUser', () => {
    it('should find alerts for specific user', async () => {
      const user = await UserRepository.create({
        email: 'alert2@test.com', name: 'Alert User 2', role: 'MANAGER', password_hash: 'hash',
        is_active: true
      }, trx);

      await AlertRepository.create({ user_id: user.id, type: 'LOW_STOCK', title: 'A1', message: 'M1' }, trx);
      await AlertRepository.create({ user_id: user.id, type: 'EXPIRY_WARNING', title: 'A2', message: 'M2' }, trx);

      const alerts = await AlertRepository.findByUser(user.id, 5, 0, trx);

      expect(alerts.length).toBe(2);
    });
  });

  describe('markResolved', () => {
    it('should mark alert as resolved', async () => {
      const user = await UserRepository.create({
        email: 'alert3@test.com', name: 'Alert User 3', role: 'MANAGER', password_hash: 'hash',
        is_active: true
      }, trx);

      const [created] = await AlertRepository.create(
        { user_id: user.id, type: 'LOW_STOCK', title: 'Test', message: 'Test msg' },
        trx
      );

      const resolved = await AlertRepository.markResolved(created.id, user.id, trx);

      expect(resolved[0].status).toBe('RESOLVED');
    });
  });
});
