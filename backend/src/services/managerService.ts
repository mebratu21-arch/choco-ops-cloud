import { db } from '../config/database.js';
import { Announcement, Task, Order, OrderItem, TaskPriority, AnnouncementPriority, TaskStatus } from '../types/manager.types.js';

export class ManagerService {
  
  // --- ANNOUNCEMENTS ---

  async getAllAnnouncements(includeInactive = true) {
    let query = db('announcements')
      .join('users', 'announcements.created_by', 'users.id')
      .select('announcements.*', 'users.full_name as author_name')
      .orderBy('announcements.created_at', 'desc');

    if (!includeInactive) {
      query = query.where('announcements.is_active', true);
    }
    
    return query;
  }

  async createAnnouncement(data: Partial<Announcement>) {
    const [newAnnouncement] = await db('announcements').insert(data).returning('*');
    return newAnnouncement;
  }

  async updateAnnouncement(id: string, data: Partial<Announcement>) {
    const [updated] = await db('announcements')
      .where({ id })
      .update({ ...data, updated_at: new Date() })
      .returning('*');
    return updated;
  }

  async deleteAnnouncement(id: string) {
    // Soft delete or hard? Let's use soft delete or inactive
    return db('announcements').where({ id }).update({ is_active: false });
  }

  // --- TASKS ---

  async getTasks(filters: any) {
    const { userId, status, assignedBy } = filters;
    let query = db('tasks')
      .join('users as assignee', 'tasks.assigned_to', 'assignee.id')
      .join('users as assigner', 'tasks.assigned_by', 'assigner.id')
      .select(
        'tasks.*', 
        'assignee.full_name as assignee_name',
        'assigner.full_name as assigner_name'
      );

    if (userId) query = query.where('tasks.assigned_to', userId);
    if (assignedBy) query = query.where('tasks.assigned_by', assignedBy);
    if (status) query = query.where('tasks.status', status);

    return query.orderBy('tasks.due_date', 'asc');
  }

  async getTaskById(id: string) {
    return db('tasks')
      .join('users as assignee', 'tasks.assigned_to', 'assignee.id')
      .join('users as assigner', 'tasks.assigned_by', 'assigner.id')
      .select(
        'tasks.*', 
        'assignee.full_name as assignee_name',
        'assigner.full_name as assigner_name'
      )
      .where('tasks.id', id)
      .first();
  }

  async createTask(data: Partial<Task>) {
    const [newTask] = await db('tasks').insert(data).returning('*');
    return newTask;
  }

  async updateTaskStatus(id: string, status: TaskStatus) {
    const [updated] = await db('tasks')
      .where({ id })
      .update({ status, updated_at: new Date() })
      .returning('*');
    return updated;
  }

  // --- ORDERS (Procurement) ---

  async getAllOrders() {
    return db('orders')
      .join('suppliers', 'orders.supplier_id', 'suppliers.id')
      .join('users', 'orders.created_by', 'users.id')
      .select(
        'orders.*',
        'suppliers.name as supplier_name',
        'users.full_name as creator_name'
      )
      .orderBy('orders.created_at', 'desc');
  }

  async getOrderById(id: string) {
    const order = await db('orders')
      .join('suppliers', 'orders.supplier_id', 'suppliers.id')
      .where('orders.id', id)
      .select('orders.*', 'suppliers.name as supplier_name')
      .first();

    if (!order) return null;

    const items = await db('order_items')
      .join('inventory_items', 'order_items.inventory_item_id', 'inventory_items.id')
      .where({ order_id: id })
      .select('order_items.*', 'inventory_items.name as item_name');

    return { ...order, items };
  }

  async createOrder(data: any, items: any[]) {
    return db.transaction(async (trx) => {
        // Generate Order Number
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const countRes = await trx('orders').count('id as count').first();
        const count = parseInt(countRes?.count as string || '0') + 1;
        const orderNumber = `PO-${dateStr}-${String(count).padStart(3, '0')}`;

        const [newOrder] = await trx('orders').insert({
            ...data,
            order_number: orderNumber,
            status: 'pending'
        }).returning('*');

        if (items && items.length > 0) {
            const itemsToInsert = items.map((item: any) => ({
                ...item,
                order_id: newOrder.id
            }));
            await trx('order_items').insert(itemsToInsert);
        }

        return newOrder;
    });
  }

  async updateOrderStatus(id: string, status: string) {
     return db.transaction(async (trx) => {
         const [updated] = await trx('orders')
          .where({ id })
          .update({ status, updated_at: new Date() })
          .returning('*');

         // If status is 'received', we could auto-increment inventory?
         // For now, let's keep it manual via the Inventory Stock Update to be safe, 
         // OR we could implement it here.
         // Let's implement auto-stock update for "received" orders for "Senior Developer" feel.
         
         if (status === 'received') {
             const items = await trx('order_items').where({ order_id: id });
             for (const item of items) {
                 // Update inventory
                 await trx('inventory_items')
                   .where({ id: item.inventory_item_id })
                   .increment('quantity', item.quantity);
                   
                 // Log movement
                 await trx('inventory_movements').insert({
                     item_id: item.inventory_item_id,
                     movement_type: 'in',
                     quantity: item.quantity,
                     reference_type: 'order',
                     reference_id: id,
                     performed_by: updated.created_by, // Or current user ideally, but we are inside service
                     notes: `Order ${updated.order_number} received`
                 });
             }
         }
         
         return updated;
     });
  }
}

export const managerService = new ManagerService();
