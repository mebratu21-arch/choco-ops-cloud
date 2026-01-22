import { db } from '../config/database.js';
import { Supplier } from '../types/domain.types.js';

export class SupplierRepository {
  static async findAll(): Promise<Supplier[]> {
    return db('suppliers')
      .whereNull('deleted_at')
      .orderBy('name');
  }

  static async findById(id: string): Promise<Supplier | undefined> {
    return db('suppliers')
      .where({ id })
      .whereNull('deleted_at')
      .first();
  }

  static async create(data: Partial<Supplier>): Promise<Supplier> {
    const [supplier] = await db('suppliers')
      .insert(data)
      .returning('*');
    return supplier;
  }

  static async update(id: string, data: Partial<Supplier>): Promise<Supplier> {
    const [supplier] = await db('suppliers')
      .where({ id })
      .update({ ...data, updated_at: new Date() })
      .returning('*');
    return supplier;
  }

  static async delete(id: string): Promise<void> {
    await db('suppliers')
      .where({ id })
      .update({ deleted_at: new Date(), is_active: false });
  }
}
