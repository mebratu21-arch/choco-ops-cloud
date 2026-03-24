import { Router } from 'express';
import { AnalyticsController } from '../../controllers/shop/analytics.controller.js';

const router = Router();

router.get('/kpis/today', AnalyticsController.getTodayKPIs);
router.get('/sales/trend', AnalyticsController.getSalesTrend);
router.get('/products/top', AnalyticsController.getTopProducts);
router.get('/sales/by-category', AnalyticsController.getSalesByCategory);

export default router;
