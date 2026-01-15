import { Project } from '../../models/Project';
import { ContentTemplate, TemplateType } from '../../models/ContentTemplate';
import { Class } from '../../models/Class';
import { AppError } from '../../middlewares/errorHandler';
import mongoose from 'mongoose';

interface CreateProjectInput {
  title: string;
  description?: string;
  classId: string;
  milestones: string[];
  rubrics: string[];
  templateId?: string;
}

export class PBLService {
  async createProject(input: CreateProjectInput) {
    const { title, description, classId, milestones, rubrics, templateId } = input;

    // Validate class
    const classData = await Class.findById(classId);
    if (!classData) {
      throw new AppError('Class not found', 404);
    }

    // If template is provided, use it
    let finalMilestones = milestones;
    let finalRubrics = rubrics;
    let finalDescription = description;

    if (templateId) {
      const template = await ContentTemplate.findOne({
        _id: templateId,
        type: TemplateType.PROJECT
      });

      if (template) {
        finalMilestones = template.structure.milestones || milestones;
        finalRubrics = template.structure.rubrics || rubrics;
        if (!finalDescription) {
          finalDescription = template.description || description;
        }
      }
    }

    const project = await Project.create({
      title,
      description: finalDescription,
      classId: new mongoose.Types.ObjectId(classId),
      milestones: finalMilestones,
      rubrics: finalRubrics,
      teams: []
    });

    return {
      id: project._id.toString(),
      title: project.title,
      description: project.description,
      milestones: project.milestones,
      rubrics: project.rubrics
    };
  }

  async getProject(projectId: string) {
    const project = await Project.findById(projectId)
      .populate('classId', 'name course academicYear')
      .populate('teams.members', 'email name');

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    return {
      id: project._id.toString(),
      title: project.title,
      description: project.description,
      milestones: project.milestones,
      rubrics: project.rubrics,
      teams: project.teams.map((team: any) => ({
        teamId: team.teamId,
        members: team.members,
        artifacts: team.artifacts
      }))
    };
  }

  async createTeam(projectId: string, teamId: string, members: string[]) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Check if team already exists
    if (project.teams.some((t: any) => t.teamId === teamId)) {
      throw new AppError('Team already exists', 400);
    }

    project.teams.push({
      teamId,
      members: members.map(id => new mongoose.Types.ObjectId(id)),
      artifacts: []
    });

    await project.save();

    return {
      message: 'Team created successfully',
      teamId
    };
  }

  async submitArtifact(projectId: string, teamId: string, artifactId: string, url: string) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const team = project.teams.find((t: any) => t.teamId === teamId);
    if (!team) {
      throw new AppError('Team not found', 404);
    }

    team.artifacts.push({
      artifactId,
      url,
      submittedAt: new Date()
    });

    await project.save();

    return {
      message: 'Artifact submitted successfully',
      artifactId
    };
  }
}
