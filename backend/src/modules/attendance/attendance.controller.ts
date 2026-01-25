import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
import { Attendance } from '../../models/Attendance';
import { AppError } from '../../middlewares/errorHandler';
import mongoose from 'mongoose';

export class AttendanceController {
  
  // Get attendance for the logged-in student
  getMyAttendance = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const studentId = req.user!.userId;
      const attendance = await Attendance.find({ studentId: new mongoose.Types.ObjectId(studentId) })
        .populate('classId', 'className subject')
        .sort({ date: -1 });
      
      res.json({ attendance });
    } catch (error) {
      next(error);
    }
  };

  // Get attendance by student ID (for Parents/Teachers)
  getStudentAttendance = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { studentId } = req.params;
      
      // Authorization check would go here (is parent of student? is teacher of student?)
      // For now, allowing basic role check or relying on middleware
      
      const attendance = await Attendance.find({ studentId: new mongoose.Types.ObjectId(studentId) })
         .populate('classId', 'className subject')
         .sort({ date: -1 });

      res.json({ attendance });
    } catch (error) {
      next(error);
    }
  };

  // Get attendance for a specific class (for Teachers)
  getClassAttendance = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { classId } = req.params;
      const attendance = await Attendance.find({ classId: new mongoose.Types.ObjectId(classId) })
        .populate('studentId', 'name email')
        .sort({ date: -1 });
        
      res.json({ attendance });
    } catch (error) {
        next(error);
    }
  };
}
