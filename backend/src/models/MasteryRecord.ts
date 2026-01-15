import mongoose, { Document, Schema } from 'mongoose';

export interface IMasteryRecord extends Document {
  studentId: mongoose.Types.ObjectId;
  conceptId: mongoose.Types.ObjectId;
  masteryScore: number; // 0-100
  confidence: number; // 0-1
  lastUpdated: Date;
  assessmentHistory: Array<{
    quizScore: number;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const MasteryRecordSchema = new Schema<IMasteryRecord>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    conceptId: { type: Schema.Types.ObjectId, ref: 'Concept', required: true },
    masteryScore: { type: Number, required: true, min: 0, max: 100, default: 0 },
    confidence: { type: Number, required: true, min: 0, max: 1, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
    assessmentHistory: [{
      quizScore: { type: Number, required: true },
      timestamp: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

MasteryRecordSchema.index({ studentId: 1, conceptId: 1 }, { unique: true });

export const MasteryRecord = mongoose.model<IMasteryRecord>('MasteryRecord', MasteryRecordSchema);
