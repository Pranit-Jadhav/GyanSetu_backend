import { Router } from 'express';
import { MasteryController } from './mastery.controller';
import { authenticate } from '../../middlewares/auth';
import { validate } from '../../middlewares/validator';
import { z } from 'zod';

const router = Router();
const masteryController = new MasteryController();

const updateMasterySchema = z.object({
  body: z.object({
    studentId: z.string().min(1),
    conceptId: z.string().min(1),
    correct: z.boolean(),
    engagement: z.number().min(0).max(2).optional()
  })
});

// Student mastery routes
router.get('/student/:studentId', authenticate, masteryController.getStudentMastery);
router.get('/concept/:studentId/:conceptId', authenticate, masteryController.getConceptMastery);
router.get('/module/:studentId/:moduleId', authenticate, masteryController.getModuleMastery);
router.get('/subject/:studentId/:subjectId', authenticate, masteryController.getSubjectMastery);
router.get('/practice/:studentId/:subjectId', authenticate, masteryController.getPracticePlan);

// Update mastery
router.post('/update', authenticate, validate(updateMasterySchema), masteryController.updateMastery);

// Analytics
router.get('/at-risk', authenticate, masteryController.getAtRiskStudents);

export default router;
