import { Router } from 'express';
import { AttendanceController } from './attendance.controller';
import { authenticate, authorize } from '../../middlewares/auth';
import { UserRole } from '../../models/User';

const router = Router();
const attendanceController = new AttendanceController();

// Student Routes
router.get('/my-history', authenticate, authorize(UserRole.STUDENT), attendanceController.getMyAttendance);

// Parent/Teacher Routes
router.get('/student/:studentId', authenticate, authorize(UserRole.PARENT, UserRole.TEACHER, UserRole.ADMIN), attendanceController.getStudentAttendance);

// Teacher Routes
router.get('/class/:classId', authenticate, authorize(UserRole.TEACHER, UserRole.ADMIN), attendanceController.getClassAttendance);

export default router;
