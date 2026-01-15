import { Request, Response, NextFunction } from 'express';
import { SoftSkillsService } from './soft-skills.service';

export class SoftSkillsController {
  private softSkillsService: SoftSkillsService;

  constructor() {
    this.softSkillsService = new SoftSkillsService();
  }

  submitPeerReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { reviewerId, revieweeId, projectId, teamwork, communication, leadership, creativity, comments } = req.body;
      const result = await this.softSkillsService.submitPeerReview({
        reviewerId,
        revieweeId,
        projectId,
        teamwork,
        communication,
        leadership,
        creativity,
        comments
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getStudentSoftSkills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { studentId } = req.params;
      const skills = await this.softSkillsService.getStudentSoftSkills(studentId);
      res.json(skills);
    } catch (error) {
      next(error);
    }
  };
}
