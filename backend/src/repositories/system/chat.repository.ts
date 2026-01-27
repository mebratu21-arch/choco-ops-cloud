import { db } from '../../config/database.js';

export interface ChatMessage {
  id: string;
  user_id: string;
  user_message: string;
  ai_response: string;
  created_at: Date;
}

export interface ChatCreateInput {
  user_id: string;
  user_message: string;
  ai_response: string;
}

export class ChatRepository {
  static async create(input: ChatCreateInput, trx?: any): Promise<ChatMessage[]> {
    const connection = trx || db;
    return connection('chat_history')
      .insert({
        user_id: input.user_id,
        user_message: input.user_message,
        ai_response: input.ai_response,
        created_at: connection.fn.now()
      })
      .returning('*');
  }

  static async findByUser(userId: string, limit = 10, offset = 0, trx?: any): Promise<ChatMessage[]> {
    const connection = trx || db;
    return connection('chat_history')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }
}
