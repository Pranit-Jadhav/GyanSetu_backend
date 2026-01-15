import { Router } from 'express';
import { EngagementController } from './engagement.controller';
import { authenticate } from '../../middlewares/auth';
import { validate } from '../../middlewares/validator';
import { z } from 'zod';

const router = Router();
const engagementController = new EngagementController();

const logEngagementSchema = z.object({
  body: z.object({
    studentId: z.string().min(1),
    classId: z.string().min(1),
    idleTime: z.number().min(0).default(0),
    interactions: z.number().min(0).default(0),
    pollParticipation: z.number().min(0).default(0),
    tabFocus: z.number().min(0).max(100).default(100)
  })
});

router.post('/log', authenticate, validate(logEngagementSchema), engagementController.logEngagement);
router.get('/class/:classId', authenticate, engagementController.getClassEngagement);
router.get('/student/:studentId', authenticate, engagementController.getStudentEngagement);

export default router;
