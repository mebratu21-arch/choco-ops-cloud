import db from '../../config/db';

export const UserService = {
  /**
   * Get all users (partial data for privacy)
   */
  async findAll() {
    return db('users')
      .select('id', 'full_name', 'email', 'role_id', 'is_active', 'last_login')
      .whereNull('deleted_at');
  },

  /**
   * Find user by ID
   */
  async findById(id: string) {
    return db('users')
      .where('id', id)
      .select('id', 'full_name', 'email', 'role_id', 'is_active', 'last_login')
      .first();
  }
};
