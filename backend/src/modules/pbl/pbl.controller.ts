import { Request, Response, NextFunction } from 'express';
import { PBLService } from './pbl.service';
import { AuthRequest } from '../../middlewares/auth';

export class PBLController {
  private pblService: PBLService;

  constructor() {
    this.pblService = new PBLService();
  }

  createProject = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { title, description, classId, milestones, rubrics } = req.body;
      const project = await this.pblService.createProject({
        title,
        description,
        classId,
        milestones,
        rubrics
      });
      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  };

  getProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const project = await this.pblService.getProject(id);
      res.json(project);
    } catch (error) {
      next(error);
    }
  };

  createTeam = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { teamId, members } = req.body;
      const result = await this.pblService.createTeam(id, teamId, members);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  submitArtifact = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { teamId, artifactId, url } = req.body;
      const result = await this.pblService.submitArtifact(id, teamId, artifactId, url);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
