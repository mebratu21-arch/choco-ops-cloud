import { Router } from 'express';
import authRoutes from './v1/auth.routes.js';
import userRoutes from './v1/user.routes.js';
import supplierRoutes from './v1/supplier.routes.js';
import rawMaterialRoutes from './v1/raw-material.routes.js';
import ingredientRoutes from './v1/ingredient.routes.js';
import inventoryRoutes from './v1/inventory.routes.js';
import recipeRoutes from './v1/recipe.routes.js';
import productionRoutes from './v1/production.routes.js';
import qualityRoutes from './v1/quality.routes.js';
import warehouseRoutes from './v1/warehouse.routes.js';
import salesRoutes from './v1/sales.routes.js';
import auditRoutes from './v1/audit.routes.js';

const router = Router();

// Authentication
router.use('/auth', authRoutes);

// User management
router.use('/users', userRoutes);

// Inventory & Materials
router.use('/suppliers', supplierRoutes);
router.use('/raw-materials', rawMaterialRoutes);
router.use('/ingredients', ingredientRoutes);
router.use('/inventory', inventoryRoutes);

// Production
router.use('/recipes', recipeRoutes);
router.use('/production', productionRoutes);

// Quality
router.use('/quality', qualityRoutes);

// Warehouse
router.use('/warehouse', warehouseRoutes);

// Sales & Orders
router.use('/sales', salesRoutes);

// Audit
router.use('/audit', auditRoutes);

export default router;
