import db from '../../config/db';

export const SupplierService = {
  async findAll() {
    return db('suppliers')
      .select('*')
      .orderBy('name', 'asc');
  },

  async findById(id: string) {
    return db('suppliers')
      .where('id', id)
      .first();
  },

  async create(data: { name: string; contact_email: string; phone?: string; country: string }) {
    const [supplier] = await db('suppliers')
      .insert({
        ...data,
        is_active: true
      })
      .returning('*');
    return supplier;
  }
};
