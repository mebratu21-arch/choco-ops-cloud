import db from '../../config/db';

export const QualityService = {
  async findAll() {
    return db('quality_controls')
      .join('production_batches', 'quality_controls.batch_id', 'production_batches.id')
      .join('users', 'quality_controls.inspector_id', 'users.id')
      .select(
        'quality_controls.*',
        'production_batches.batch_number',
        'users.full_name as inspector_name'
      )
      .orderBy('inspection_date', 'desc');
  }
};
