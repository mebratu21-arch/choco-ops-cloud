import { db } from '../../config/database.js';
import { RawMaterial } from '../../types/domain.types.js';

export class RawMaterialRepository {
  static async findAll(): Promise<RawMaterial[]> {
    return db('raw_materials')
      .leftJoin('suppliers', 'raw_materials.supplier_id', 'suppliers.id')
      .select('raw_materials.*', 'suppliers.name as supplier_name')
      .whereNull('raw_materials.deleted_at')
      .orderBy('raw_materials.name');
  }

  static async findById(id: string): Promise<RawMaterial | undefined> {
    return db('raw_materials')
      .leftJoin('suppliers', 'raw_materials.supplier_id', 'suppliers.id')
      .select('raw_materials.*', 'suppliers.name as supplier_name')
      .where('raw_materials.id', id)
      .whereNull('raw_materials.deleted_at')
      .first();
  }

  static async findLowStock(): Promise<RawMaterial[]> {
    return db('raw_materials')
      .whereRaw('current_stock < minimum_stock')
      .whereNull('deleted_at')
      .orderBy('name');
  }

  static async create(data: Partial<RawMaterial>): Promise<RawMaterial> {
    const [material] = await db('raw_materials')
      .insert(data)
      .returning('*');
    return material;
  }

  static async update(id: string, data: Partial<RawMaterial>): Promise<RawMaterial> {
    const [material] = await db('raw_materials')
      .where({ id })
      .update({ ...data, updated_at: new Date() })
      .returning('*');
    return material;
  }

  static async delete(id: string): Promise<void> {
    await db('raw_materials')
      .where({ id })
      .update({ deleted_at: new Date(), is_active: false });
  }
}
