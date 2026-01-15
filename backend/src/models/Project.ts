import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description?: string;
  classId: mongoose.Types.ObjectId;
  milestones: string[];
  rubrics: string[];
  teams: Array<{
    teamId: string;
    members: mongoose.Types.ObjectId[];
    artifacts: Array<{
      artifactId: string;
      url: string;
      submittedAt: Date;
    }>;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true },
    description: { type: String },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    milestones: [{ type: String }],
    rubrics: [{ type: String }],
    teams: [{
      teamId: { type: String, required: true },
      members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      artifacts: [{
        artifactId: { type: String, required: true },
        url: { type: String, required: true },
        submittedAt: { type: Date, default: Date.now }
      }]
    }]
  },
  { timestamps: true }
);

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
