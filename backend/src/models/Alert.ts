import mongoose, { Document, Schema } from 'mongoose';

export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum AlertType {
  CONFUSION = 'CONFUSION',
  ENGAGEMENT_DROP = 'ENGAGEMENT_DROP',
  MASTERY_THRESHOLD = 'MASTERY_THRESHOLD',
  POLL_CONFUSION = 'POLL_CONFUSION'
}

export interface IAlert extends Document {
  classId: mongoose.Types.ObjectId;
  studentId?: mongoose.Types.ObjectId;
  conceptId?: mongoose.Types.ObjectId;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User' },
    conceptId: { type: Schema.Types.ObjectId, ref: 'Concept' },
    type: { type: String, enum: Object.values(AlertType), required: true },
    severity: { type: String, enum: Object.values(AlertSeverity), required: true },
    message: { type: String, required: true },
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: Date },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

AlertSchema.index({ classId: 1, resolved: 1, createdAt: -1 });

export const Alert = mongoose.model<IAlert>('Alert', AlertSchema);
