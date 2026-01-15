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
      const studentId = req.user!.userId;
      const result = await this.classroomService.joinClass(id, studentId);
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
}
