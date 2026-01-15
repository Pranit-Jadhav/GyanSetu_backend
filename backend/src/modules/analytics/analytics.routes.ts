import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authenticate, authorize } from '../../middlewares/auth';

const router = Router();
const analyticsController = new AnalyticsController();

router.get('/teacher', authenticate, authorize('TEACHER', 'ADMIN'), analyticsController.getTeacherDashboard);
router.get('/admin', authenticate, authorize('ADMIN'), analyticsController.getAdminDashboard);

export default router;
