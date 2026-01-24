import mongoose, { Document, Schema } from 'mongoose';

export interface IMasterySnapshot extends Document {
  snapshotId: string;
  studentId: mongoose.Types.ObjectId;
  levelType: 'concept' | 'module' | 'subject';
  levelId: string; // Generic ID reference
  masteryScore: number; // 0-100
  timestamp: Date;
}

const MasterySnapshotSchema = new Schema<IMasterySnapshot>(
  {
    snapshotId: { type: String, required: true, unique: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    levelType: { type: String, enum: ['concept', 'module', 'subject'], required: true },
    levelId: { type: String, required: true },
    masteryScore: { type: Number, required: true, min: 0, max: 100 },
    timestamp: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

// Compound index for efficient velocity queries
MasterySnapshotSchema.index({ studentId: 1, levelId: 1, timestamp: 1 });

export const MasterySnapshot = mongoose.model<IMasterySnapshot>('MasterySnapshot', MasterySnapshotSchema);
