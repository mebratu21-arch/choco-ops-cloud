
import { Request, Response } from 'express';
import db from '../db';
import { initializeDatabase } from '../db/init';

// Machines
export const getMachines = async (req: Request, res: Response) => {
  try {
    const data = await db('machines').orderBy('name', 'asc');
    res.json(data);
  } catch (error: any) {
    console.error('Machines Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateMachineStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await db('machines').where({ id }).update({ status });
    
    const updatedMachine = await db('machines').where({ id }).first();
    req.io?.emit('machine_update', updatedMachine);

    res.json({ success: true, status });
  } catch (error) {
    console.error('Machine Update Error:', error);
    res.status(500).json({ error: 'Failed to update machine status' });
  }
};

// Tasks
export const getTasks = async (req: Request, res: Response) => {
  try {
    const data = await db('tasks').orderBy('due_date', 'asc');
    res.json(data);
  } catch (error: any) {
    console.error('Tasks Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, priority, assigned_to, due_date } = req.body;
    const [newTask] = await db('tasks').insert({
      title,
      description,
      priority,
      assigned_to,
      due_date,
      status: 'todo'
    }).returning('*');
    res.json(newTask);
  } catch (error: any) {
    console.error('Create Task Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateTaskStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await db('tasks').where({ id }).update({ status });
    res.json({ success: true });
  } catch (error: any) {
    console.error('Task Status Update Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Alerts
export const getAlerts = async (req: Request, res: Response) => {
  try {
    const data = await db('alerts').orderBy('created_at', 'desc');
    res.json(data);
  } catch (error: any) {
    console.error('Alerts Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const ackAlert = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await db('alerts').where({ id }).update({ status: 'ack' });
    res.json({ success: true });
  } catch (error: any) {
    console.error('Alert Ack Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Logistics
export const getLogistics = async (req: Request, res: Response) => {
  try {
    const data = await db('logistics').orderBy('timestamp', 'desc').limit(50);
    res.json(data);
  } catch (error: any) {
    console.error('Logistics Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Stats
export const getKPIStats = async (req: Request, res: Response) => {
  try {
    const activeBatches = await db('batches').whereNot('status', 'completed').count('* as count').first();
    const machines = await db('machines').select('status');
    const operationalCount = machines.filter(m => m.status === 'operational').length;
    const totalMachines = machines.length;
    const uptime = totalMachines > 0 ? Math.round((operationalCount / totalMachines) * 100) : 100;

    const chartData = await db('daily_stats').orderBy('order_index', 'asc');
    
    const totalQc = await db('qc_records').count('* as count').first();
    const approvedQc = await db('qc_records').where('result', 'approved').count('* as count').first();
    const passRate = Number(totalQc?.count) > 0 ? ((Number(approvedQc?.count) / Number(totalQc?.count)) * 100).toFixed(1) : '100.0';

    // Dynamic Productivity: (Actual Output / Target Output) * 100 for completed batches
    const productionStats = await db('batches')
      .where('status', 'completed')
      .sum('target_quantity as target')
      .sum('actual_quantity as actual')
      .first();

    const target = Number(productionStats?.target) || 0;
    const actual = Number(productionStats?.actual) || 0;
    const productivity = target > 0 ? ((actual / target) * 100).toFixed(1) : '95.0';

    res.json({
      activeLoad: activeBatches?.count || 0,
      assetUptime: uptime,
      passRate: passRate,
      productivity: productivity,
      chartData
    });
  } catch (error: any) {
    console.error('Stats Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getSalesStats = async (req: Request, res: Response) => {
  try {
    // 1. Revenue Stream (Last 7 days from orders)
    // Note: 'orders' table has created_at
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const revenueData = await db('orders')
      .select(db.raw("to_char(created_at, 'Dy') as day"), db.raw("SUM(amount) as revenue"), db.raw("COUNT(*) as orders"))
      .where('created_at', '>=', thirtyDaysAgo)
      .andWhere('status', 'completed')
      .groupBy('day')
      .orderByRaw("max(created_at) ASC"); // Rudimentary sort, ideally use actual date

    // 2. Boutique Orders (Recent 10)
    const recentOrders = await db('orders')
      .join('users', 'orders.user_id', 'users.id')
      .join('products', 'orders.product_id', 'products.id')
      .select(
        'orders.id',
        'users.full_name as client',
        'products.name as item',
        'products.category',
        'orders.amount',
        'orders.status',
        'orders.created_at as date'
      )
      .orderBy('orders.created_at', 'desc')
      .limit(10);

    // 3. Trending SKUs (Top 5 by sales volume)
    const trending = await db('orders')
      .join('products', 'orders.product_id', 'products.id')
      .select('products.name', 'products.category', db.raw('COUNT(*) as sales'))
      .where('orders.status', 'completed')
      .groupBy('products.name', 'products.category')
      .orderBy('sales', 'desc')
      .limit(5);

    // Calculate totals
    const totalRevenue = await db('orders').where('status', 'completed').sum('amount as total').first();
    const totalOrders = await db('orders').where('status', 'completed').count('* as count').first();
    const avgOrderValue = Number(totalOrders?.count) > 0 ? (Number(totalRevenue?.total) / Number(totalOrders?.count)).toFixed(2) : '0.00';

    res.json({
      chartData: revenueData,
      recentOrders: recentOrders.map(o => ({
        ...o,
        date: new Date(o.date).toISOString().split('T')[0] // Format YYYY-MM-DD
      })),
      trending: trending.map(t => ({
        ...t,
        growth: '+5.0%', // Placeholder for now unless we calculate period-over-period
        icon: '🍫' // Placeholder
      })),
      kpi: {
        revenue: Number(totalRevenue?.total || 0).toFixed(2),
        orders: Number(totalOrders?.count || 0),
        aov: avgOrderValue
      }
    });

  } catch (error: any) {
    console.error('Sales Stats Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Init
export const initSystem = async (req: Request, res: Response) => {
  try {
    const result = await initializeDatabase(); // Logic from schema.ts
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
