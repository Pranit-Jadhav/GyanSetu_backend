import { Router } from 'express';
import { PBLController } from './pbl.controller';
import { authenticate, authorize } from '../../middlewares/auth';
import { validate } from '../../middlewares/validator';
import { z } from 'zod';

const router = Router();
const pblController = new PBLController();

const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    classId: z.string().min(1),
    milestones: z.array(z.string()),
    rubrics: z.array(z.string())
  })
});

const createTeamSchema = z.object({
  body: z.object({
    teamId: z.string().min(1),
    members: z.array(z.string().min(1))
  })
});

const submitArtifactSchema = z.object({
  body: z.object({
    teamId: z.string().min(1),
    artifactId: z.string().min(1),
    url: z.string().url()
  })
});

router.post('/', authenticate, authorize('TEACHER', 'ADMIN'), validate(createProjectSchema), pblController.createProject);
router.get('/:id', authenticate, pblController.getProject);
router.post('/:id/team', authenticate, validate(createTeamSchema), pblController.createTeam);
router.post('/:id/artifact', authenticate, validate(submitArtifactSchema), pblController.submitArtifact);

export default router;
