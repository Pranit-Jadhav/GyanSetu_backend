import mongoose, { Document, Schema } from 'mongoose';

export interface IModule extends Document {
  name: string;
  code: string;
  subjectId: mongoose.Types.ObjectId;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ModuleSchema = new Schema<IModule>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    description: { type: String }
  },
  { timestamps: true }
);

ModuleSchema.index({ subjectId: 1, code: 1 }, { unique: true });

export const Module = mongoose.model<IModule>('Module', ModuleSchema);
