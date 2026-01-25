import { db, disconnectDB } from '../../src/config/database.js';
import { ChatRepository } from '../../src/repositories/chat.repository.js';
import { UserRepository } from '../../src/repositories/user.repository.js';

describe('ChatRepository', () => {
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
    it('should save chat message', async () => {
      const user = await UserRepository.create({
        email: 'chat@test.com', name: 'Chat User', role: 'WAREHOUSE', password_hash: 'hash',
        is_active: true
      }, trx);

      const input = {
        user_id: user.id,
        user_message: 'Hello AI',
        ai_response: 'Hi there!',
      };

      const [entry] = await ChatRepository.create(input, trx);

      expect(entry.user_message).toBe('Hello AI');
      expect(entry.ai_response).toBe('Hi there!');
      expect(entry.user_id).toBe(user.id);
    });
  });

  describe('findByUser', () => {
    it('should return recent messages for user', async () => {
      const user = await UserRepository.create({
        email: 'chat2@test.com', name: 'Chat User 2', role: 'WAREHOUSE', password_hash: 'hash',
        is_active: true
      }, trx);

      await ChatRepository.create({ user_id: user.id, user_message: 'Msg1', ai_response: 'Reply1' }, trx);
      await ChatRepository.create({ user_id: user.id, user_message: 'Msg2', ai_response: 'Reply2' }, trx);

      const messages = await ChatRepository.findByUser(user.id, 10, 0, trx);

      expect(messages.length).toBe(2);
      const messagesContent = messages.map((m: any) => m.user_message);
      expect(messagesContent).toContain('Msg1');
      expect(messagesContent).toContain('Msg2');
    });
  });
});
