import { db } from './src/config/database.js';

async function runShopMigration() {
  try {
    console.log('Running shop orders migration...');
    
    // Create shop_orders table
    await db.raw(`
      CREATE TABLE IF NOT EXISTS shop_orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_name VARCHAR(255),
        customer_email VARCHAR(255),
        customer_phone VARCHAR(50),
        payment_method VARCHAR(50) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        tax DECIMAL(10, 2) DEFAULT 0,
        total DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_shop_orders_created_at ON shop_orders(created_at);
      CREATE INDEX IF NOT EXISTS idx_shop_orders_status ON shop_orders(status);
    `);
    
    console.log('✅ shop_orders table created');
    
    // Create shop_order_items table
    await db.raw(`
      CREATE TABLE IF NOT EXISTS shop_order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL,
        product_id UUID NOT NULL,
        sku VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        quantity INTEGER NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES shop_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
      );
    `);
    
    console.log('✅ shop_order_items table created');
    console.log('✅ Migration complete!');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

runShopMigration();
