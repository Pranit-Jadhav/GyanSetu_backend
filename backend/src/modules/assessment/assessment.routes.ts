import { Router } from 'express';
import { AssessmentController } from './assessment.controller';
import { authenticate, authorize } from '../../middlewares/auth';
import { validate } from '../../middlewares/validator';
import { z } from 'zod';

const router = Router();
const assessmentController = new AssessmentController();

const createManualSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    classroomId: z.string().min(1),
    subjectId: z.string().min(1),
    duration: z.number().min(1).optional(),
    questions: z.array(z.object({
      question: z.string().min(1),
      options: z.array(z.string()).length(4),
      correctAnswer: z.number().min(0).max(3),
      conceptId: z.string().optional(),
      difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional()
    }))
  })
});

const generateAISchema = z.object({
  body: z.object({
    topic: z.string().min(1),
    subjectId: z.string().min(1),
    classroomId: z.string().min(1),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
    questionCount: z.number().int().min(1).max(50),
    duration: z.number().min(1).optional()
  })
});

const submitSchema = z.object({
  body: z.object({
    answers: z.array(z.object({
      questionId: z.string().min(1),
      selectedOption: z.number().min(0).max(3)
    })),
    timeSpent: z.number().min(0),
    engagement: z.number().min(0).max(2).optional()
  })
});

router.get('/teacher', authenticate, authorize('TEACHER', 'ADMIN'), assessmentController.getTeacherAssessments);
router.post('/manual', authenticate, authorize('TEACHER', 'ADMIN'), validate(createManualSchema), assessmentController.createManual);
router.post('/ai-generate', authenticate, authorize('TEACHER', 'ADMIN'), validate(generateAISchema), assessmentController.generateAI);
router.post('/:id/launch', authenticate, authorize('TEACHER', 'ADMIN'), assessmentController.launch);
router.post('/:id/submit', authenticate, authorize('STUDENT'), validate(submitSchema), assessmentController.submit);
router.get('/:id', authenticate, assessmentController.getAssessment);
router.get('/:id/results', authenticate, authorize('TEACHER', 'ADMIN'), assessmentController.getResults);
router.get('/:id/attempt', authenticate, authorize('STUDENT'), assessmentController.getMyAttempt);
router.get('/classroom/:classroomId', authenticate, assessmentController.getAssessmentsByClassroom);

export default router;
