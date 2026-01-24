import mongoose, { Document, Schema } from 'mongoose';

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  INCOMPLETE = 'INCOMPLETE'
}

export interface IAttendance extends Document {
  studentId: mongoose.Types.ObjectId;
  sessionId: string;
  classId: mongoose.Types.ObjectId;
  date: Date;
  joinTime: Date;
  leaveTime?: Date;
  durationMinutes: number;
  status: AttendanceStatus;
  warnings: number;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: String, required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    date: { type: Date, required: true },
    joinTime: { type: Date, required: true },
    leaveTime: { type: Date },
    durationMinutes: { type: Number, default: 0 },
    status: { type: String, enum: Object.values(AttendanceStatus), default: AttendanceStatus.INCOMPLETE },
    warnings: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Compound index to ensure one attendance record per student per session
AttendanceSchema.index({ studentId: 1, sessionId: 1 }, { unique: true });

export const Attendance = mongoose.model<IAttendance>('Attendance', AttendanceSchema);
