import db from '../../config/db';

export const RawMaterialService = {
  async findAll() {
    return db('raw_materials')
      .join('suppliers', 'raw_materials.supplier_id', 'suppliers.id')
      .select(
        'raw_materials.*',
        'suppliers.name as supplier_name'
      )
      .orderBy('raw_materials.name', 'asc');
  },

  async findById(id: string) {
    return db('raw_materials')
      .where('id', id)
      .first();
  },

  /**
   * Get materials that are below their reorder point
   */
  async getLowStock() {
    return db('raw_materials')
      .whereRaw('quantity <= reorder_point')
      .select('*');
  }
};
