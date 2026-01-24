import { Router } from 'express';
import { LearningPaceController } from './learning-pace.controller';
import { authenticate, authorize } from '../../middlewares/auth';

const router = Router();
const controller = new LearningPaceController();

// All routes require teacher access
router.use(authenticate);
router.use(authorize('TEACHER', 'ADMIN'));

router.get('/class/:classId/learning-pace', controller.getClassLearningPace);
router.get('/class/:classId/at-risk', controller.getAtRiskStudents);
router.get('/student/:studentId/learning-velocity', controller.getStudentVelocity);
router.post('/seed', controller.seedMockData);

export default router;
