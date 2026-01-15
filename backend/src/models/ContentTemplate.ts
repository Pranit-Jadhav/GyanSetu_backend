import mongoose, { Document, Schema } from 'mongoose';

export enum TemplateType {
  PROJECT = 'PROJECT',
  ASSESSMENT = 'ASSESSMENT',
  RUBRIC = 'RUBRIC'
}

export interface IContentTemplate extends Document {
  type: TemplateType;
  title: string;
  description?: string;
  subjectId?: mongoose.Types.ObjectId;
  structure: Record<string, any>; // Flexible structure based on type
  createdBy: mongoose.Types.ObjectId;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContentTemplateSchema = new Schema<IContentTemplate>(
  {
    type: { type: String, enum: Object.values(TemplateType), required: true },
    title: { type: String, required: true },
    description: { type: String },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
    structure: { type: Schema.Types.Mixed, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isPublic: { type: Boolean, default: false }
  },
  { timestamps: true }
);

ContentTemplateSchema.index({ type: 1, subjectId: 1 });
ContentTemplateSchema.index({ createdBy: 1 });

export const ContentTemplate = mongoose.model<IContentTemplate>('ContentTemplate', ContentTemplateSchema);
