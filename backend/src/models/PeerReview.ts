import mongoose, { Document, Schema } from 'mongoose';

export interface IPeerReview extends Document {
  reviewerId: mongoose.Types.ObjectId;
  revieweeId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  teamwork: number; // 0-100
  communication: number; // 0-100
  leadership: number; // 0-100
  creativity: number; // 0-100
  comments?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PeerReviewSchema = new Schema<IPeerReview>(
  {
    reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    revieweeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    teamwork: { type: Number, min: 0, max: 100, required: true },
    communication: { type: Number, min: 0, max: 100, required: true },
    leadership: { type: Number, min: 0, max: 100, required: true },
    creativity: { type: Number, min: 0, max: 100, required: true },
    comments: { type: String }
  },
  { timestamps: true }
);

PeerReviewSchema.index({ reviewerId: 1, revieweeId: 1, projectId: 1 }, { unique: true });

export const PeerReview = mongoose.model<IPeerReview>('PeerReview', PeerReviewSchema);
