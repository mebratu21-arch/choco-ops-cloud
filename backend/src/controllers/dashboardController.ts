import { Request, Response } from 'express';
import { db } from '../config/database.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Parallel queries for speed
    const [
      activeBatches,
      pendingOrders,
      lowStockItems,
      openAlerts
    ] = await Promise.all([
      db('production_batches').whereIn('status', ['queued', 'in_progress']).count('id as count').first(),
      db('orders').where('status', 'pending').count('id as count').first(),
      db('inventory_items').whereRaw('quantity <= reorder_level').count('id as count').first(),
      db('sos_alerts').whereIn('status', ['pending', 'assigned']).count('id as count').first()
    ]);

    const stats = {
      activeBatches: parseInt(activeBatches?.count as string || '0'),
      pendingOrders: parseInt(pendingOrders?.count as string || '0'),
      lowStockItems: parseInt(lowStockItems?.count as string || '0'),
      openAlerts: parseInt(openAlerts?.count as string || '0')
    };

    return successResponse(res, stats);
  } catch (error: any) {
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
