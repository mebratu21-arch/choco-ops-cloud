import db from '../../config/db';

export const ProductionService = {
  async findAll() {
    return db('production_batches')
      .join('users', 'production_batches.supervisor_id', 'users.id')
      .select('production_batches.*', 'users.full_name as supervisor_name')
      .orderBy('start_date', 'desc');
  },

  async findById(id: string) {
    const batch = await db('production_batches')
      .where('id', id)
      .first();
      
    if (batch) {
      batch.materials = await db('batch_materials')
        .join('raw_materials', 'batch_materials.material_id', 'raw_materials.id')
        .where('batch_id', id)
        .select('raw_materials.name', 'batch_materials.quantity_used');
    }
    
    return batch;
  }
};
