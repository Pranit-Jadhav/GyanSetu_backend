import mongoose, { Document, Schema } from 'mongoose';

export interface IEngagementLog extends Document {
  studentId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  idleTime: number; // seconds
  interactions: number;
  pollParticipation: number;
  tabFocus: number; // percentage
  engagementIndex: number; // 0-1
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EngagementLogSchema = new Schema<IEngagementLog>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    idleTime: { type: Number, default: 0 },
    interactions: { type: Number, default: 0 },
    pollParticipation: { type: Number, default: 0 },
    tabFocus: { type: Number, default: 100 },
    engagementIndex: { type: Number, min: 0, max: 1, default: 0 },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

EngagementLogSchema.index({ studentId: 1, classId: 1, timestamp: -1 });

export const EngagementLog = mongoose.model<IEngagementLog>('EngagementLog', EngagementLogSchema);
