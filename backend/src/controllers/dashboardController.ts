import { Request, Response } from 'express';
import { db } from '../config/database.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate date 30 days from now for expiry alerts
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // Parallel queries for comprehensive dashboard stats
    const [
      totalItems,
      lowStockItems,
      expiringItems,
      activeBatches,
      completedToday,
      plannedBatches,
      quarantineQC,
      approvedToday,
      rejectedToday,
      openAlerts,
      operationalMachines,
      downMachines
    ] = await Promise.all([
      // Inventory stats
      db('inventory_items').count('id as count').first(),
      db('inventory_items').whereRaw('quantity <= reorder_level').count('id as count').first(),
      db('inventory_items')
        .whereNotNull('expiry_date')
        .where('expiry_date', '<=', thirtyDaysFromNow)
        .where('quantity', '>', 0)
        .count('id as count').first(),

      // Production stats
      db('production_batches').whereIn('status', ['pending', 'mixing', 'cooking', 'cooling', 'packaging', 'in_progress']).count('id as count').first(),
      db('production_batches').where('status', 'completed').where('completed_at', '>=', today).count('id as count').first(),
      db('production_batches').whereIn('status', ['pending', 'queued']).count('id as count').first(),

      // QC stats - using 'quarantine' as pending since enum is: approved, rejected, quarantine
      db('qc_checks').where('result', 'quarantine').count('id as count').first(),
      db('qc_checks').where('result', 'approved').where('created_at', '>=', today).count('id as count').first(),
      db('qc_checks').where('result', 'rejected').where('created_at', '>=', today).count('id as count').first(),

      // Mechanics stats
      db('sos_alerts').whereIn('status', ['open', 'pending', 'assigned', 'in_progress']).count('id as count').first(),
      db('machines').where('status', 'operational').count('id as count').first(),
      db('machines').whereIn('status', ['maintenance', 'down', 'offline', 'sos']).count('id as count').first()
    ]);

    // Calculate QC pass rate from all-time stats for more meaningful data
    const allApproved = await db('qc_checks').where('result', 'approved').count('id as count').first();
    const allRejected = await db('qc_checks').where('result', 'rejected').count('id as count').first();
    const totalAllQC = parseInt(allApproved?.count as string || '0') + parseInt(allRejected?.count as string || '0');
    const passRate = totalAllQC > 0 ? Math.round((parseInt(allApproved?.count as string || '0') / totalAllQC) * 100) : 100;

    const stats = {
      // Legacy format for backwards compatibility
      activeBatches: parseInt(activeBatches?.count as string || '0'),
      pendingOrders: 0,
      lowStockItems: parseInt(lowStockItems?.count as string || '0'),
      openAlerts: parseInt(openAlerts?.count as string || '0'),

      // New detailed format for Manager Dashboard
      inventory_summary: {
        total_items: parseInt(totalItems?.count as string || '0'),
        low_stock_count: parseInt(lowStockItems?.count as string || '0'),
        expiring_soon_count: parseInt(expiringItems?.count as string || '0')
      },
      production_summary: {
        active_batches: parseInt(activeBatches?.count as string || '0'),
        completed_today: parseInt(completedToday?.count as string || '0'),
        planned_batches: parseInt(plannedBatches?.count as string || '0')
      },
      qc_summary: {
        pending_inspections: parseInt(quarantineQC?.count as string || '0'),
        approved_today: parseInt(approvedToday?.count as string || '0'),
        rejected_today: parseInt(rejectedToday?.count as string || '0'),
        pass_rate: passRate
      },
      mechanics_summary: {
        active_alerts: parseInt(openAlerts?.count as string || '0'),
        machines_operational: parseInt(operationalMachines?.count as string || '0'),
        machines_down: parseInt(downMachines?.count as string || '0')
      }
    };

    return successResponse(res, stats);
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return errorResponse(res, error.message);
  }
};

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    // Mock trends for demo visualization (complex aggregations would go here)
    const analytics = {
      productionTrends: [
        { name: 'Mon', value: 12 },
        { name: 'Tue', value: 19 },
        { name: 'Wed', value: 15 },
        { name: 'Thu', value: 22 },
        { name: 'Fri', value: 25 },
        { name: 'Sat', value: 30 },
        { name: 'Sun', value: 10 }
      ],
      qcTrends: [
        { name: 'Pass', value: 85 },
        { name: 'Fail', value: 15 }
      ],
      inventoryTrends: [
        { name: 'Raw', value: 400 },
        { name: 'WIP', value: 300 },
        { name: 'Finished', value: 300 }
      ]
    };
    return successResponse(res, analytics);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};
