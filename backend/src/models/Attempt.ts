import mongoose, { Document, Schema } from 'mongoose';

export interface IAttempt extends Document {
  assessmentId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  answers: Array<{
    questionId: mongoose.Types.ObjectId;
    selectedOption: number;
    isCorrect: boolean;
  }>;
  score: number;
  maxScore: number;
  percentage: number;
  timeSpent: number; // in seconds
  engagement: number; // 0-1 engagement score
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AttemptSchema = new Schema<IAttempt>(
  {
    assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    answers: [{
      questionId: { type: Schema.Types.ObjectId, required: true },
      selectedOption: { type: Number, required: true },
      isCorrect: { type: Boolean, required: true }
    }],
    score: { type: Number, required: true, default: 0 },
    maxScore: { type: Number, required: true },
    percentage: { type: Number, required: true },
    timeSpent: { type: Number, default: 0 },
    engagement: { type: Number, default: 1.0, min: 0, max: 2.0 },
    submittedAt: { type: Date }
  },
  { timestamps: true }
);

AttemptSchema.index({ assessmentId: 1, studentId: 1 }, { unique: true });
AttemptSchema.index({ studentId: 1, submittedAt: -1 });

export const Attempt = mongoose.model<IAttempt>('Attempt', AttemptSchema);
