import { Request, Response, NextFunction } from 'express';
import { ClassroomService } from './classroom.service';
import { AuthRequest } from '../../middlewares/auth';

export class ClassroomController {
  private classroomService: ClassroomService;

  constructor() {
    this.classroomService = new ClassroomService();
  }

  createClass = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, academicYear, course } = req.body;
      const teacherId = req.user!.userId;
      const classData = await this.classroomService.createClass({
        name,
        academicYear,
        course,
        teacherId
      });
      res.status(201).json(classData);
    } catch (error) {
      next(error);
    }
  };

  getClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const classData = await this.classroomService.getClassById(id);
      res.json(classData);
    } catch (error) {
      next(error);
    }
  };

  joinClassByCode = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { joinCode } = req.body;
      const studentId = req.user!.userId;
      const result = await this.classroomService.joinClassByCode(joinCode, studentId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  joinClass = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { classroomId } = req.body;
      const studentId = req.user!.userId;

      // Support both route param and body param for classroomId
      const targetClassroomId = id || classroomId;

      if (!targetClassroomId) {
        return res.status(400).json({ message: 'Classroom ID is required' });
      }

      const result = await this.classroomService.joinClass(targetClassroomId, studentId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const students = await this.classroomService.getStudents(id);
      res.json({ students });
    } catch (error) {
      next(error);
    }
  };

  getUserClasses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      let classrooms;
      if (userRole === 'TEACHER' || userRole === 'ADMIN') {
        classrooms = await this.classroomService.getTeacherClasses(userId);
      } else if (userRole === 'STUDENT') {
        classrooms = await this.classroomService.getStudentClasses(userId);
      } else {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.json({ classrooms });
    } catch (error) {
      next(error);
    }
  };
}
