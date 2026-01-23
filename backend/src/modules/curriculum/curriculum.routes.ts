import { Router } from 'express';
import { CurriculumController } from './curriculum.controller';
import { authenticate, authorize } from '../../middlewares/auth';
import { validate } from '../../middlewares/validator';
import { z } from 'zod';

const router = Router();
const curriculumController = new CurriculumController();

const createSubjectSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    code: z.string().min(1),
    description: z.string().optional()
  })
});

const createModuleSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    code: z.string().min(1),
    subjectId: z.string().min(1),
    description: z.string().optional()
  })
});

const createConceptSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    code: z.string().min(1),
    moduleId: z.string().min(1),
    subjectId: z.string().min(1),
    description: z.string().optional(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
    prerequisites: z.array(z.string()).optional()
  })
});

// Subject routes
router.post('/subjects', authenticate, authorize('ADMIN', 'TEACHER'), validate(createSubjectSchema), curriculumController.createSubject);
router.get('/subjects', authenticate, curriculumController.getAllSubjects);
router.get('/subjects/:id', authenticate, curriculumController.getSubject);

// Module routes
router.post('/modules', authenticate, authorize('ADMIN', 'TEACHER'), validate(createModuleSchema), curriculumController.createModule);
router.get('/modules/subject/:subjectId', authenticate, curriculumController.getModulesBySubject);
router.get('/modules/:id', authenticate, curriculumController.getModule);

// Concept routes
router.post('/concepts', authenticate, authorize('ADMIN', 'TEACHER'), validate(createConceptSchema), curriculumController.createConcept);
router.get('/concepts/subject/:subjectId', authenticate, curriculumController.getConceptsBySubject);
router.get('/concepts/module/:moduleId', authenticate, curriculumController.getConceptsByModule);
router.get('/concepts/:id', authenticate, curriculumController.getConcept);

// Full curriculum
router.get('/subjects/:subjectId/full', authenticate, curriculumController.getFullCurriculum);

// Available subjects for students
router.get('/subjects/available', authenticate, authorize('STUDENT'), curriculumController.getAvailableSubjects);

export default router;
