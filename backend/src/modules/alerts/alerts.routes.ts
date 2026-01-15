import { Router } from 'express';
import { AlertsController } from './alerts.controller';
import { authenticate, authorize } from '../../middlewares/auth';

const router = Router();
const alertsController = new AlertsController();

router.get('/class/:classId', authenticate, authorize('TEACHER', 'ADMIN'), alertsController.getClassAlerts);
router.post('/:id/resolve', authenticate, authorize('TEACHER', 'ADMIN'), alertsController.resolveAlert);

export default router;
