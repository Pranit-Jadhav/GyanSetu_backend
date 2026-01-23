import mongoose, { Document, Schema } from 'mongoose';

export enum AssessmentType {
  MANUAL = 'MANUAL',
  AI_GENERATED = 'AI_GENERATED'
}

export enum AssessmentStatus {
  DRAFT = 'DRAFT',
  LAUNCHED = 'LAUNCHED',
  COMPLETED = 'COMPLETED'
}

export interface IQuestion extends Document {
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  conceptId?: mongoose.Types.ObjectId;
  points: number;
}

const QuestionSchema = new Schema<IQuestion>({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true, min: 0 },
  conceptId: { type: Schema.Types.ObjectId, ref: 'Concept' },
  points: { type: Number, default: 1 }
}, { _id: true });

export interface IAssessment extends Document {
  title: string;
  description?: string;
  type: AssessmentType;
  status: AssessmentStatus;
  classId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  questions: IQuestion[];
  createdBy: mongoose.Types.ObjectId;
  launchedAt?: Date;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AssessmentSchema = new Schema<IAssessment>(
  {
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: Object.values(AssessmentType), required: true },
    status: { type: String, enum: Object.values(AssessmentStatus), default: AssessmentStatus.DRAFT },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    questions: [QuestionSchema],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    launchedAt: { type: Date },
    dueDate: { type: Date }
  },
  { timestamps: true }
);

export const Assessment = mongoose.model<IAssessment>('Assessment', AssessmentSchema);
