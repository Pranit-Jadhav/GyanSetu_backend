import { Request, Response, NextFunction } from 'express';
import { LearningPaceService } from './learning-pace.service';
import { ClassroomService } from '../classroom/classroom.service';
import { AuthRequest } from '../../middlewares/auth';

export class LearningPaceController {
  private learningPaceService: LearningPaceService;
  private classroomService: ClassroomService;

  constructor() {
    this.learningPaceService = new LearningPaceService();
    this.classroomService = new ClassroomService();
  }

  getClassLearningPace = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { classId } = req.params;
      // Get student IDs from classroom
      const students = await this.classroomService.getStudents(classId);
      const studentIds = students.map((s: any) => s.id);
      
      const result = await this.learningPaceService.getClassPaceOverviewByIds(studentIds);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getAtRiskStudents = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { classId } = req.params;
      const students = await this.classroomService.getStudents(classId);
      const studentIds = students.map((s: any) => s.id);

      const result = await this.learningPaceService.getAtRiskStudents(studentIds, 'global_subject');
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getStudentVelocity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { studentId } = req.params;
      const result = await this.learningPaceService.getStudentVelocity(studentId, 'global_subject');
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  // Helper to generate mock data for testing
  seedMockData = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { classId } = req.body;
      const students = await this.classroomService.getStudents(classId);
      const studentIds = students.map((s: any) => s.id);

      // Generate 10-15 snapshots per student over last 20 days
      for (const sId of studentIds) {
        let baseScore = 50 + Math.random() * 30; // Random start
        const velocity = (Math.random() - 0.4) * 2; // -0.8 to 1.2 velocity

        for (let i = 0; i < 15; i++) {
          const daysAgo = 20 - i; // 20 days ago to 6 days ago (approx)
          // Simple linear progression with noise
          const score = Math.max(0, Math.min(100, baseScore + (velocity * i) + (Math.random() * 5 - 2.5)));
          
          const timestamp = new Date();
          timestamp.setDate(timestamp.getDate() - daysAgo);

          await this.learningPaceService.recordSnapshot(sId, 'subject', 'global_subject', score, timestamp);
        }
      }

      res.json({ message: 'Mock snapshots generated' });
    } catch (error) {
       // Only for dev
       next(error);
    }
  }
}
