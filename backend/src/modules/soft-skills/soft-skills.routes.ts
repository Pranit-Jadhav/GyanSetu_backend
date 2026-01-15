import { Router } from 'express';
import { SoftSkillsController } from './soft-skills.controller';
import { authenticate } from '../../middlewares/auth';
import { validate } from '../../middlewares/validator';
import { z } from 'zod';

const router = Router();
const softSkillsController = new SoftSkillsController();

const peerReviewSchema = z.object({
  body: z.object({
    reviewerId: z.string().min(1),
    revieweeId: z.string().min(1),
    projectId: z.string().min(1),
    teamwork: z.number().min(0).max(100),
    communication: z.number().min(0).max(100),
    leadership: z.number().min(0).max(100),
    creativity: z.number().min(0).max(100),
    comments: z.string().optional()
  })
});

router.post('/peer-review', authenticate, validate(peerReviewSchema), softSkillsController.submitPeerReview);
router.get('/:studentId', authenticate, softSkillsController.getStudentSoftSkills);

export default router;
