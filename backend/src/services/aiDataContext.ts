/**
 * AI Data Context Provider
 * Queries actual database tables to provide real, exact answers for the AI chatbot.
 */
import { db } from '../config/database.js';

export interface FactoryDataContext {
  inventory: string;
  machines: string;
  production: string;
  recipes: string;
  quality: string;
  alerts: string;
  workers: string;
  suppliers: string;
  warehouse: string;
  orders: string;
}

/**
 * Query real inventory data from the database
 */
async function getInventoryContext(searchQuery?: string): Promise<string> {
  try {
    let query = db('inventory_items')
      .select('name', 'quantity', 'unit', 'category', 'location', 'reorder_level', 'expiry_date');

    if (searchQuery) {
      // Clean up common queries like "where is", "is there any", etc.
      const noiseWords = [
        'where is', 'is there any', 'do we have', 'find', 'search for', 'tell me about',
        'how much', 'how many', 'status of', 'what is the', 'can you find', 'show me',
        'details of', 'information about', 'stock of', 'quantity of', 'level of',
        'is left', 'are left', 'remaining', 'in stock', 'available', 'where', 'find'
      ];
      
      let cleanSearch = searchQuery.toLowerCase();
      noiseWords.forEach(word => {
        cleanSearch = cleanSearch.split(word).join('');
      });
      
      cleanSearch = cleanSearch.replace(/[?!.]/g, '').trim();
      
      if (cleanSearch) {
        // Try searching by name or category
        query = query.where(function() {
          this.where('name', 'ilike', `%${cleanSearch}%`)
              .orWhere('category', 'ilike', `%${cleanSearch}%`)
              .orWhere('location', 'ilike', `%${cleanSearch}%`);
        });
      }
    }

    const items = await query.orderBy('name');

    if (!items.length) {
      return searchQuery ? `I couldn't find any inventory items matching "${searchQuery}".` : 'No inventory items found in the database.';
    }

    const lowStock = items.filter((i: any) => Number(i.quantity) <= Number(i.reorder_level));
    const total = items.length;

    let result = '';
    
    // If we have search results and found exactly one item, use the PREMIUM "Found it!" format
    if (searchQuery && items.length === 1) {
      const item = items[0];
      const qty = Number(item.quantity).toFixed(1);
      const isLow = Number(item.quantity) <= Number(item.reorder_level);
      const statusIcon = isLow ? '⚠️' : '✅';
      const statusText = isLow ? 'LOW STOCK' : 'IN STOCK';
      
      result = `Found it! **${item.name}** is currently sitting in **${item.location?.split('|')[0]?.trim() || 'Warehouse'}**.\n\n`;
      result += `### 🎯 Exact Details:\n`;
      result += `• **Item**: ${item.name}\n`;
      result += `• **Quantity**: ${qty} ${item.unit}\n`;
      result += `• **Status**: ${statusIcon} ${statusText}\n`;
      result += `• **Location**: ${item.location || 'Not specifically assigned'}\n`;
      if (item.expiry_date) result += `• **Expiry**: ${new Date(item.expiry_date).toLocaleDateString()}\n`;
      if (item.category) result += `• **Category**: ${item.category.replace(/_/g, ' ')}\n`;
      result += `\nIs there anything else you need to know about this item?`;
      return result;
    }

    result = searchQuery 
      ? `🔍 **Search Results for "${searchQuery}"** (${total} matches):\n\n`
      : `📦 **Inventory Status** (${total} items total):\n\n`;

    // Group by category
    const byCategory: Record<string, any[]> = {};
    items.forEach((item: any) => {
      const cat = item.category || 'uncategorized';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(item);
    });

    for (const [category, catItems] of Object.entries(byCategory)) {
      result += `**${category.replace(/_/g, ' ').toUpperCase()}:**\n`;
      catItems.forEach((item: any) => {
        const qty = Number(item.quantity).toFixed(1);
        const isLow = Number(item.quantity) <= Number(item.reorder_level);
        const status = isLow ? '⚠️ LOW' : '✅';
        const loc = item.location ? ` | ${item.location}` : '';
        const exp = item.expiry_date ? ` | Exp: ${new Date(item.expiry_date).toLocaleDateString()}` : '';
        result += `• **${item.name}**: ${qty} ${item.unit} ${status}${loc}${exp}\n`;
      });
      result += '\n';
    }

    if (lowStock.length > 0 && !searchQuery) {
      result += `\n⚠️ **${lowStock.length} item(s) below reorder level!**\n`;
      lowStock.forEach((item: any) => {
        result += `  - ${item.name}: ${Number(item.quantity).toFixed(1)} ${item.unit} (reorder at ${Number(item.reorder_level).toFixed(1)})\n`;
      });
    } else if (!searchQuery) {
      result += `\n✅ All items are above reorder levels.`;
    }

    return result;
  } catch (error) {
    console.error('AI Context - Inventory query error:', error);
    return 'Unable to fetch inventory data at this time.';
  }
}

/**
 * Query real machine data
 */
async function getMachineContext(): Promise<string> {
  try {
    const machines = await db('machines')
      .select('name', 'machine_code', 'type', 'status', 'location', 'next_maintenance_date')
      .orderBy('name');

    if (!machines.length) return 'No machines found in the database.';

    let result = `⚙️ **Machine Status** (${machines.length} machines):\n\n`;

    machines.forEach((m: any) => {
      const statusIcon = m.status === 'operational' ? '✅' : m.status === 'maintenance' ? '🔧' : m.status === 'sos' ? '🚨' : '❌';
      const nextMaint = m.next_maintenance_date ? ` | Next maintenance: ${new Date(m.next_maintenance_date).toLocaleDateString()}` : '';
      result += `• **${m.name}** (${m.machine_code}) — ${statusIcon} ${m.status.toUpperCase()}${nextMaint}\n`;
    });

    const opCount = machines.filter((m: any) => m.status === 'operational').length;
    const downCount = machines.length - opCount;
    result += `\n**Summary**: ${opCount} operational, ${downCount} in maintenance/down`;

    return result;
  } catch (error) {
    console.error('AI Context - Machine query error:', error);
    return 'Unable to fetch machine data at this time.';
  }
}

/**
 * Query real production batch data
 */
async function getProductionContext(): Promise<string> {
  try {
    const batches = await db('production_batches')
      .select('production_batches.batch_number', 'production_batches.status', 'production_batches.target_quantity', 'production_batches.actual_quantity', 'production_batches.started_at', 'production_batches.completed_at', 'recipes.name as recipe_name')
      .leftJoin('recipes', 'production_batches.recipe_id', 'recipes.id')
      .orderBy('production_batches.created_at', 'desc')
      .limit(10);

    if (!batches.length) return 'No production batches found in the database.';

    let result = `🏭 **Recent Production Batches** (showing last ${batches.length}):\n\n`;

    batches.forEach((b: any) => {
      const statusIcon = b.status === 'completed' ? '✅' : b.status === 'failed' ? '❌' : '🔄';
      const qty = b.actual_quantity ? `${Number(b.actual_quantity).toFixed(0)}/${Number(b.target_quantity).toFixed(0)}` : `Target: ${Number(b.target_quantity).toFixed(0)}`;
      const recipe = b.recipe_name ? ` — ${b.recipe_name}` : '';
      result += `• **${b.batch_number}**${recipe}: ${statusIcon} ${b.status.toUpperCase()} (${qty})\n`;
    });

    const completed = batches.filter((b: any) => b.status === 'completed').length;
    const inProgress = batches.filter((b: any) => !['completed', 'failed'].includes(b.status)).length;
    result += `\n**Summary**: ${completed} completed, ${inProgress} in progress`;

    return result;
  } catch (error) {
    console.error('AI Context - Production query error:', error);
    return 'Unable to fetch production data at this time.';
  }
}

/**
 * Query real recipe data
 */
async function getRecipeContext(): Promise<string> {
  try {
    const recipes = await db('recipes')
      .select('name', 'category', 'yield_quantity', 'yield_unit', 'duration_minutes', 'difficulty_level', 'instructions')
      .where('is_active', true)
      .orderBy('name');

    if (!recipes.length) return 'No active recipes found in the database.';

    let result = `📖 **Available Recipes** (${recipes.length} active):\n\n`;

    recipes.forEach((r: any, idx: number) => {
      const time = r.duration_minutes ? `${r.duration_minutes} min` : 'N/A';
      const difficulty = r.difficulty_level ? ` | ${r.difficulty_level}` : '';
      result += `${idx + 1}. **${r.name}** (${r.category}) — Yield: ${Number(r.yield_quantity).toFixed(0)} ${r.yield_unit}, Time: ${time}${difficulty}\n`;
    });

    return result;
  } catch (error) {
    console.error('AI Context - Recipe query error:', error);
    return 'Unable to fetch recipe data at this time.';
  }
}

/**
 * Query real QC data
 */
async function getQualityContext(): Promise<string> {
  try {
    const checks = await db('qc_checks')
      .select('qc_checks.*', 'production_batches.batch_number')
      .leftJoin('production_batches', 'qc_checks.batch_id', 'production_batches.id')
      .orderBy('qc_checks.created_at', 'desc')
      .limit(10);

    if (!checks.length) return 'No quality control checks found in the database.';

    const approved = checks.filter((c: any) => c.result === 'approved').length;
    const rejected = checks.filter((c: any) => c.result === 'rejected').length;
    const passRate = checks.length > 0 ? ((approved / checks.length) * 100).toFixed(1) : '0';

    let result = `✅ **Quality Control Summary** (last ${checks.length} inspections):\n\n`;
    result += `• **Pass rate**: ${passRate}%\n`;
    result += `• **Approved**: ${approved} | **Rejected**: ${rejected}\n\n`;

    result += `**Recent Inspections:**\n`;
    checks.slice(0, 5).forEach((c: any) => {
      const icon = c.result === 'approved' ? '✅' : c.result === 'rejected' ? '❌' : '⏳';
      const scores = [c.appearance_score, c.texture_score, c.taste_score].filter(Boolean);
      const avgScore = scores.length > 0 ? (scores.reduce((a: number, b: number) => a + b, 0) / scores.length).toFixed(1) : 'N/A';
      result += `• ${icon} **${c.batch_number || 'Unknown batch'}** — ${c.result.toUpperCase()} (Avg score: ${avgScore}/5, Defects: ${c.defect_count || 0})\n`;
    });

    return result;
  } catch (error) {
    console.error('AI Context - QC query error:', error);
    return 'Unable to fetch quality data at this time.';
  }
}

/**
 * Query real SOS alerts
 */
async function getAlertContext(): Promise<string> {
  try {
    const alerts = await db('sos_alerts')
      .select('sos_alerts.*', 'machines.name as machine_name', 'u1.full_name as reporter_name', 'u2.full_name as assignee_name')
      .leftJoin('machines', 'sos_alerts.machine_id', 'machines.id')
      .leftJoin('users as u1', 'sos_alerts.reported_by', 'u1.id')
      .leftJoin('users as u2', 'sos_alerts.assigned_to', 'u2.id')
      .orderBy('sos_alerts.reported_at', 'desc')
      .limit(10);

    if (!alerts.length) return '🚨 **No alerts found.** All systems are operating normally.';

    const open = alerts.filter((a: any) => a.status === 'open' || a.status === 'in_progress');
    const resolved = alerts.filter((a: any) => a.status === 'resolved');

    let result = `🚨 **Alerts & SOS** (${open.length} active, ${resolved.length} resolved):\n\n`;

    if (open.length > 0) {
      result += `**Active Alerts:**\n`;
      open.forEach((a: any) => {
        const priorityIcon = a.priority === 'critical' ? '🔴' : a.priority === 'high' ? '🟠' : '🟡';
        result += `• ${priorityIcon} **${a.machine_name || 'System'}** — ${a.problem_description} (${a.priority.toUpperCase()}) — Assigned to: ${a.assignee_name || 'Unassigned'}\n`;
      });
    } else {
      result += `✅ No active alerts at this time.\n`;
    }

    if (resolved.length > 0) {
      result += `\n**Recently Resolved:**\n`;
      resolved.slice(0, 3).forEach((a: any) => {
        result += `• ✅ ${a.machine_name || 'System'} — ${a.resolution_notes || a.problem_description}\n`;
      });
    }

    return result;
  } catch (error) {
    console.error('AI Context - Alerts query error:', error);
    return 'Unable to fetch alert data at this time.';
  }
}

/**
 * Query real user/worker data
 */
async function getWorkerContext(): Promise<string> {
  try {
    const users = await db('users')
      .select('full_name', 'role', 'is_active', 'email')
      .orderBy('role');

    if (!users.length) return 'No users found in the database.';

    const active = users.filter((u: any) => u.is_active);
    const byRole: Record<string, any[]> = {};
    active.forEach((u: any) => {
      if (!byRole[u.role]) byRole[u.role] = [];
      byRole[u.role].push(u);
    });

    let result = `👥 **Workforce** (${active.length} active of ${users.length} total):\n\n`;

    for (const [role, roleUsers] of Object.entries(byRole)) {
      result += `**${role.replace(/_/g, ' ').toUpperCase()}** (${roleUsers.length}):\n`;
      roleUsers.forEach((u: any) => {
        result += `  • ${u.full_name} (${u.email})\n`;
      });
      result += '\n';
    }

    return result;
  } catch (error) {
    console.error('AI Context - Worker query error:', error);
    return 'Unable to fetch worker data at this time.';
  }
}

/**
 * Query real supplier data
 */
async function getSupplierContext(): Promise<string> {
  try {
    const suppliers = await db('suppliers')
      .select('*')
      .orderBy('name');

    if (!suppliers.length) return 'No suppliers found in the database.';

    let result = `🚚 **Suppliers** (${suppliers.length} total):\n\n`;
    suppliers.forEach((s: any) => {
      const contact = s.contact_person ? ` — Contact: ${s.contact_person}` : '';
      const email = s.email ? ` (${s.email})` : '';
      result += `• **${s.name}**${contact}${email}\n`;
    });

    return result;
  } catch (error) {
    console.error('AI Context - Supplier query error:', error);
    return 'Unable to fetch supplier data at this time.';
  }
}

/**
 * Query warehouse/location data from inventory items
 */
async function getWarehouseContext(searchQuery?: string): Promise<string> {
  try {
    let query = db('inventory_items')
      .select('name', 'quantity', 'unit', 'location', 'category')
      .whereNotNull('location');

    if (searchQuery) {
      const noiseWords = [
        'where is', 'is there any', 'do we have', 'find', 'search for', 'location of',
        'where', 'locate', 'find', 'the', 'tell me'
      ];
      
      let cleanSearch = searchQuery.toLowerCase();
      noiseWords.forEach(word => {
        cleanSearch = cleanSearch.split(word).join('');
      });
      
      cleanSearch = cleanSearch.replace(/[?!.]/g, '').trim();
      
      if (cleanSearch) {
        query = query.where(function() {
          this.where('name', 'ilike', `%${cleanSearch}%`)
              .orWhere('location', 'ilike', `%${cleanSearch}%`);
        });
      }
    }

    const items = await query.orderBy('location');

    if (!items.length) return searchQuery ? `I couldn't find any warehouse locations matching "${searchQuery}".` : 'No warehouse location data available.';

    // If single item found, use the PREMIUM format
    if (searchQuery && items.length === 1) {
      const item = items[0];
      return `Found it! **${item.name}** is stored at: **${item.location}**.\n\n### 🏭 Location Details:\n• **Zone**: ${item.location?.split('|')[0]?.trim() || 'Unknown'}\n• **Exact Spot**: ${item.location}\n• **Current Stock**: ${Number(item.quantity).toFixed(1)} ${item.unit}`;
    }

    // Group by location/zone
    const byZone: Record<string, any[]> = {};
    items.forEach((item: any) => {
      const zone = item.location?.split('|')[0]?.trim() || item.location || 'Unassigned';
      if (!byZone[zone]) byZone[zone] = [];
      byZone[zone].push(item);
    });

    let result = `🏭 **Warehouse Zones** (${Object.keys(byZone).length} zones):\n\n`;

    for (const [zone, zoneItems] of Object.entries(byZone)) {
      const totalQty = zoneItems.reduce((sum: number, i: any) => sum + Number(i.quantity), 0);
      result += `**${zone}** (${zoneItems.length} items, ${totalQty.toFixed(0)} units total):\n`;
      zoneItems.slice(0, 5).forEach((item: any) => {
        result += `  • ${item.name}: ${Number(item.quantity).toFixed(1)} ${item.unit}\n`;
      });
      if (zoneItems.length > 5) result += `  • ... and ${zoneItems.length - 5} more items\n`;
      result += '\n';
    }

    return result;
  } catch (error) {
    console.error('AI Context - Warehouse query error:', error);
    return 'Unable to fetch warehouse data at this time.';
  }
}

/**
 * Master function - fetches the appropriate data context for a given topic
 */
export async function getDataContextForTopic(topic: string, userMessage?: string): Promise<string> {
  switch (topic) {
    case 'inventory': return getInventoryContext(userMessage);
    case 'machine': return getMachineContext();
    case 'production': return getProductionContext();
    case 'recipe': return getRecipeContext();
    case 'quality': return getQualityContext();
    case 'alert': return getAlertContext();
    case 'worker': return getWorkerContext();
    case 'supplier': return getSupplierContext();
    case 'warehouse': return getWarehouseContext(userMessage);
    case 'logs': return getAlertContext(); // Show alerts as "logs" equivalent
    case 'access': return getWorkerContext(); // Show users for access context
    default: return '';
  }
}

/**
 * Get a comprehensive factory overview (used for general/default questions)
 */
export async function getFactoryOverview(): Promise<string> {
  try {
    const [inventoryCount, machineCount, batchCount, recipeCount, alertCount, userCount] = await Promise.all([
      db('inventory_items').count('* as count').first(),
      db('machines').count('* as count').first(),
      db('production_batches').count('* as count').first(),
      db('recipes').where('is_active', true).count('* as count').first(),
      db('sos_alerts').whereIn('status', ['open', 'in_progress']).count('* as count').first(),
      db('users').where('is_active', true).count('* as count').first(),
    ]);

    const lowStockCount = await db('inventory_items')
      .whereRaw('quantity <= reorder_level')
      .count('* as count')
      .first();

    const opMachines = await db('machines').where('status', 'operational').count('* as count').first();

    return `📊 **Factory Overview:**\n\n` +
      `• **Inventory**: ${inventoryCount?.count || 0} items (${lowStockCount?.count || 0} low stock)\n` +
      `• **Machines**: ${machineCount?.count || 0} total (${opMachines?.count || 0} operational)\n` +
      `• **Production Batches**: ${batchCount?.count || 0}\n` +
      `• **Active Recipes**: ${recipeCount?.count || 0}\n` +
      `• **Active Alerts**: ${alertCount?.count || 0}\n` +
      `• **Active Staff**: ${userCount?.count || 0}\n\n` +
      `Ask me about any specific area for detailed information!`;
  } catch (error) {
    console.error('AI Context - Factory overview error:', error);
    return '';
  }
}
