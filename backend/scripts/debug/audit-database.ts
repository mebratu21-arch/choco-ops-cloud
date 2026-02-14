import { db } from './src/config/database.js';

async function auditDatabase() {
  console.log('\n=== DATABASE INTEGRITY AUDIT ===\n');
  
  try {
    // Check if products table exists
    const hasProducts = await db.schema.hasTable('products');
    console.log(`✓ Products table exists: ${hasProducts}`);
    
    if (hasProducts) {
      const products = await db('products').select('*');
      console.log(`✓ Total products in DB: ${products.length}`);
      
      // Check SKU prefixes
      const chocoOpsProducts = products.filter(p => p.name?.startsWith('ChocoOps'));
      console.log(`✓ Products with "ChocoOps" prefix: ${chocoOpsProducts.length}`);
      
      // Check SKU format
      const validSKUs = products.filter(p => p.sku?.match(/^CHOC-/));
      console.log(`✓ Products with valid SKU format (CHOC-*): ${validSKUs.length}`);
      
      // List all products
      console.log('\nProduct Inventory:');
      products.forEach(p => {
        console.log(`  - ${p.name} | SKU: ${p.sku} | Stock: ${p.stock || 'N/A'}`);
      });
    }
    
    // Check ingredients table
    const hasIngredients = await db.schema.hasTable('ingredients');
    console.log(`\n✓ Ingredients table exists: ${hasIngredients}`);
    
    if (hasIngredients) {
      const ingredients = await db('ingredients').select('*');
      console.log(`✓ Total ingredients: ${ingredients.length}`);
      
      // Check low stock items (< 20% of optimal)
      const lowStock = ingredients.filter(i => {
        const threshold = (i.optimal_stock || 0) * 0.2;
        return (i.current_stock || 0) < threshold;
      });
      console.log(`⚠️  Low stock items (< 20% optimal): ${lowStock.length}`);
      lowStock.forEach(i => {
        const pct = ((i.current_stock / i.optimal_stock) * 100).toFixed(1);
        console.log(`  - ${i.name}: ${i.current_stock}/${i.optimal_stock} (${pct}%)`);
      });
    }
    
    // Check users and roles
    const users = await db('users').select('role').groupBy('role');
    console.log('\n✓ User roles in system:');
    users.forEach(u => console.log(`  - ${u.role}`));
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Audit failed:', err);
    process.exit(1);
  }
}

auditDatabase();
