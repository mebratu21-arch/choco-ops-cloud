import { db } from '../config/database.js';
import { InventoryItem, InventoryFilters, StockUpdate, InventoryMovement } from '../types/inventory.types.js';

export class InventoryService {
  
  async getAllItems(filters: InventoryFilters) {
    const { search, category, lowStock, page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    let query = db('inventory_items').select('*');

    if (search) {
      query = query.where(builder => {
        builder.where('name', 'ilike', `%${search}%`)
          .orWhere('code', 'ilike', `%${search}%`);
      });
    }

    if (category) {
      query = query.where('category', category);
    }

    if (lowStock) {
      query = query.whereRaw('quantity <= reorder_level');
    }

    // Get total count for pagination
    const countQuery = query.clone().count('id as total').first();
    const totalResult = await countQuery;
    const total = parseInt(totalResult?.total as string || '0');

    // Get data
    const items = await query.orderBy('name', 'asc').limit(limit).offset(offset);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getItemById(id: string) {
    return db('inventory_items').where({ id }).first();
  }

  async getItemByCode(code: string) {
    return db('inventory_items').where({ code }).first();
  }

  async createItem(data: Partial<InventoryItem>) {
    const [newItem] = await db('inventory_items').insert(data).returning('*');
    return newItem;
  }

  async updateItem(id: string, data: Partial<InventoryItem>) {
    const [updatedItem] = await db('inventory_items')
      .where({ id })
      .update({ ...data, updated_at: new Date() })
      .returning('*');
    return updatedItem;
  }

  async deleteItem(id: string) {
    return db('inventory_items').where({ id }).del();
  }

  async updateStock(id: string, quantity: number, updateData: StockUpdate, userId: string) {
    return db.transaction(async (trx) => {
      // 1. Get current item
      const item = await trx('inventory_items').where({ id }).first();
      if (!item) throw new Error('Item not found');

      // 2. Calculate new quantity
      let newQuantity = Number(item.quantity);
      if (updateData.movementType === 'in') {
        newQuantity += quantity;
      } else if (updateData.movementType === 'out' || updateData.movementType === 'expired') {
        newQuantity -= quantity;
      } else if (updateData.movementType === 'adjustment') {
        // For adjustment, quantity is the adjustment amount (positive or negative)
        // OR user sends absolute value? Convention: user sends delta. 
        // Let's assume quantity is absolute change.
        // If user wants to set exact stock, they use logic. 
        // Assuming quantity passed here is the delta to apply.
        // If movementType is adjustment, quantity can be positive or negative?
        
        // Actually, for safer logic usually:
        // IN: + qty
        // OUT: - qty
        // ADJUSTMENT: could be + or -
        
        // Let's assume the passed 'quantity' is always positive magnitude, and movement type dictates direction?
        // Or if adjustment, maybe we accept signed?
        // Let's stick to: "in" adds, "out"/"expired" subtracts. 
        // "adjustment": let's handle as signed check or assume the caller handles the sign logic?
        // Typically UI sends "Add 5" (in), "Remove 5" (out).
        // For "Set to 50", UI calculates delta.
        
        // Let's treat 'adjustment' as just adding the signed quantity? 
        // Or simple: If movementType is adjustment, we just Add (assuming caller sent negative if needed).
        // But types say 'quantity' usually implies magnitude.
        
        // Let's refine:
        // If adjustment, we'll verify logic. But simplistic:
        // We will assume quantity is always the delta magnitude, except for adjustment where logic might vary.
        // Let's assume adjustment implies a correction. It acts like "in" if positive?
        // Simple approach:
        // IN -> +
        // OUT, EXPIRED -> -
        // ADJUSTMENT -> + (caller sends negative if reducing)
        newQuantity += quantity;
      }

      if (newQuantity < 0) {
        throw new Error('Insufficient stock');
      }

      // 3. Update Item
      const [updatedItem] = await trx('inventory_items')
        .where({ id })
        .update({ quantity: newQuantity, updated_at: new Date() })
        .returning('*');

      // 4. Create Movement Record
      await trx('inventory_movements').insert({
        item_id: id,
        movement_type: updateData.movementType,
        quantity: quantity, // Log the delta magnitude or signed? usually magnitude + type
        reference_type: updateData.referenceType,
        reference_id: updateData.referenceId,
        performed_by: userId,
        notes: updateData.reason
      });

      return updatedItem;
    });
  }

  async getLowStockAlerts() {
    return db('inventory_items').whereRaw('quantity <= reorder_level');
  }

  async getExpiryAlerts(daysAhead: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    
    return db('inventory_items')
      .whereNotNull('expiry_date')
      .where('expiry_date', '<=', futureDate)
      .where('quantity', '>', 0) // Only alert if we have stock
      .orderBy('expiry_date', 'asc');
  }

  async getMovementHistory(itemId: string) {
    return db('inventory_movements')
      .join('users', 'inventory_movements.performed_by', 'users.id')
      .where({ item_id: itemId })
      .select(
        'inventory_movements.*',
        'users.full_name as performed_by_name'
      )
      .orderBy('inventory_movements.created_at', 'desc');
  }
  
  async searchItems(term: string) {
      return db('inventory_items')
        .where('name', 'ilike', `%${term}%`)
        .orWhere('code', 'ilike', `%${term}%`)
        .orderBy('name', 'asc')
        .limit(10);
  }
}

export const inventoryService = new InventoryService();
