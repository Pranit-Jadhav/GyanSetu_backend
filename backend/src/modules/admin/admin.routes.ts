import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticate, authorize } from '../../middlewares/auth';
import { validate } from '../../middlewares/validator';
import { z } from 'zod';

const router = Router();
const adminController = new AdminController();

const createTemplateSchema = z.object({
  body: z.object({
    type: z.enum(['PROJECT', 'ASSESSMENT', 'RUBRIC']),
    title: z.string().min(1),
    description: z.string().optional(),
    subjectId: z.string().optional(),
    structure: z.record(z.any()),
    isPublic: z.boolean().optional()
  })
});

router.post('/templates', authenticate, authorize('ADMIN', 'TEACHER'), validate(createTemplateSchema), adminController.createTemplate);
router.get('/templates', authenticate, adminController.getTemplates);
router.get('/templates/:id', authenticate, adminController.getTemplate);
router.get('/dashboard', authenticate, authorize('ADMIN'), adminController.getDashboard);

export default router;
