import { db } from '../config/database.js';
import { QCCheck, QCDefect, QCFilters, QCStats } from '../types/qc.types.js';

export class QCService {
  
  async getAllQCChecks(filters: QCFilters) {
    const { result, batchId, inspectorId, startDate, endDate, page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    let query = db('qc_checks')
      .join('users', 'qc_checks.inspector_id', 'users.id')
      .join('production_batches', 'qc_checks.batch_id', 'production_batches.id')
      .select(
        'qc_checks.*',
        'users.full_name as inspector_name',
        'production_batches.batch_number'
      );

    if (result) query = query.where('qc_checks.result', result);
    if (batchId) query = query.where('qc_checks.batch_id', batchId);
    if (inspectorId) query = query.where('qc_checks.inspector_id', inspectorId);
    if (startDate && endDate) {
      query = query.whereBetween('qc_checks.inspection_date', [startDate, endDate]);
    }

    const countQuery = query.clone().clearSelect().count('qc_checks.id as total').first();
    const totalResult = await countQuery;
    const total = parseInt(totalResult?.total as string || '0');

    const checks = await query.orderBy('qc_checks.inspection_date', 'desc').limit(limit).offset(offset);

    return {
      checks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getQCCheckById(id: string) {
    const check = await db('qc_checks')
      .join('users', 'qc_checks.inspector_id', 'users.id')
      .join('production_batches', 'qc_checks.batch_id', 'production_batches.id')
      .where('qc_checks.id', id)
      .select(
        'qc_checks.*',
        'users.full_name as inspector_name',
        'production_batches.batch_number'
      )
      .first();

    if (!check) return null;

    const defects = await db('qc_defects').where({ qc_check_id: id });
    return { ...check, defects };
  }

  async createQCCheck(data: Partial<QCCheck>, defects: Partial<QCDefect>[] = []) {
    return db.transaction(async (trx) => {
      // 1. Create QC Check
      const [newCheck] = await trx('qc_checks').insert(data).returning('*');

      // 2. Insert Defects if present
      if (defects.length > 0) {
        const defectsToInsert = defects.map(d => ({
          ...d,
          qc_check_id: newCheck.id
        }));
        await trx('qc_defects').insert(defectsToInsert);
      }

      // 3. Update Batch Status based on result (optional but good for workflow)
      // If approved -> might trigger batch completion or release
      // If rejected -> might trigger 'failed' status
      if (data.result === 'rejected') {
          await trx('production_batches').where({ id: data.batch_id }).update({ status: 'failed' });
      } 
      
      return newCheck;
    });
  }

  async updateQCCheck(id: string, data: Partial<QCCheck>) {
    const [updated] = await db('qc_checks')
      .where({ id })
      .update({ ...data }) // Assuming defects update handled separately or not allowed for audit reasons
      .returning('*');
    return updated;
  }

  async deleteQCCheck(id: string) {
    return db('qc_checks').where({ id }).del();
  }

  async getQCStats(dateRange?: { start: string; end: string }): Promise<QCStats> {
    let query = db('qc_checks');
    
    if (dateRange) {
      query = query.whereBetween('inspection_date', [dateRange.start, dateRange.end]);
    }

    const totalInspectionsResult = await query.clone().count('id as count').first();
    const totalInspections = parseInt(totalInspectionsResult?.count as string || '0');

    if (totalInspections === 0) {
        return {
            totalInspections: 0,
            passRate: 0,
            averageScores: { appearance: 0, texture: 0, taste: 0 },
            topDefects: []
        };
    }

    const passedResult = await query.clone().where('result', 'approved').count('id as count').first();
    const passedCount = parseInt(passedResult?.count as string || '0');
    const passRate = (passedCount / totalInspections) * 100;

    const avgScores = await query.clone()
      .avg('appearance_score as appearance')
      .avg('texture_score as texture')
      .avg('taste_score as taste')
      .first();

    // Get top defects
    // Need to join? QC Defects has defect_type.
    let defectQuery = db('qc_defects')
        .select('defect_type')
        .count('id as count')
        .groupBy('defect_type')
        .orderBy('count', 'desc')
        .limit(5);

    if (dateRange) {
        defectQuery = defectQuery.whereExists(function() {
            this.select('*').from('qc_checks')
                .whereRaw('qc_checks.id = qc_defects.qc_check_id')
                .whereBetween('qc_checks.inspection_date', [dateRange.start, dateRange.end]);
        });
    }
    
    const topDefects = await defectQuery;

    // QC result enum is: approved, rejected, quarantine - using 'quarantine' as pending
    const pendingResult = await query.clone().where('result', 'quarantine').count('id as count').first();
    const pendingCount = parseInt(pendingResult?.count as string || '0');

    return {
      totalInspections,
      passRate: parseFloat(passRate.toFixed(1)),
      averageScores: {
        appearance: parseFloat(avgScores?.appearance || '0'),
        texture: parseFloat(avgScores?.texture || '0'),
        taste: parseFloat(avgScores?.taste || '0')
      },
      topDefects: topDefects.map((d: any) => ({ type: d.defect_type, count: parseInt(d.count) })),
      byResult: {
          approved: passedCount,
          pending: pendingCount,
          rejected: totalInspections - passedCount - pendingCount
      }
    };
  }

  async getDefectsByType(dateRange?: { start: string; end: string }) {
    let query = db('qc_defects')
        .select('defect_type', 'severity')
        .count('id as count')
        .groupBy('defect_type', 'severity');
        
    // Apply date filter logic similarly if needed
    return query;
  }
}

export const qcService = new QCService();
