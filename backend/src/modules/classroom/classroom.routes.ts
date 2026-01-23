import { Router } from 'express';
import { ClassroomController } from './classroom.controller';
import { authenticate, authorize } from '../../middlewares/auth';
import { validate } from '../../middlewares/validator';
import { z } from 'zod';

const router = Router();
const classroomController = new ClassroomController();

const createClassSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    academicYear: z.string().min(1),
    course: z.string().min(1)
  })
});

const joinClassByCodeSchema = z.object({
  body: z.object({
    joinCode: z.string().min(1)
  })
});

router.get('/', authenticate, classroomController.getUserClasses);
router.post('/', authenticate, authorize('TEACHER', 'ADMIN'), validate(createClassSchema), classroomController.createClass);
router.get('/:id', authenticate, classroomController.getClass);
router.post('/join', authenticate, authorize('STUDENT'), validate(joinClassByCodeSchema), classroomController.joinClassByCode);
router.post('/:id/join', authenticate, authorize('STUDENT'), classroomController.joinClass);
router.get('/:id/students', authenticate, classroomController.getStudents);

export default router;
