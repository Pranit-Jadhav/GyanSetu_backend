import { PeerReview } from '../../models/PeerReview';
import { AppError } from '../../middlewares/errorHandler';
import mongoose from 'mongoose';

interface SubmitPeerReviewInput {
  reviewerId: string;
  revieweeId: string;
  projectId: string;
  teamwork: number;
  communication: number;
  leadership: number;
  creativity: number;
  comments?: string;
}

export class SoftSkillsService {
  async submitPeerReview(input: SubmitPeerReviewInput) {
    const { reviewerId, revieweeId, projectId, teamwork, communication, leadership, creativity, comments } = input;

    // Check if review already exists
    const existing = await PeerReview.findOne({
      reviewerId: new mongoose.Types.ObjectId(reviewerId),
      revieweeId: new mongoose.Types.ObjectId(revieweeId),
      projectId: new mongoose.Types.ObjectId(projectId)
    });

    if (existing) {
      throw new AppError('Peer review already submitted', 400);
    }

    const review = await PeerReview.create({
      reviewerId: new mongoose.Types.ObjectId(reviewerId),
      revieweeId: new mongoose.Types.ObjectId(revieweeId),
      projectId: new mongoose.Types.ObjectId(projectId),
      teamwork,
      communication,
      leadership,
      creativity,
      comments
    });

    return {
      message: 'Peer review submitted successfully',
      reviewId: review._id.toString()
    };
  }

  async getStudentSoftSkills(studentId: string) {
    const reviews = await PeerReview.find({
      revieweeId: new mongoose.Types.ObjectId(studentId)
    })
      .populate('reviewerId', 'email name')
      .populate('projectId', 'title');

    if (reviews.length === 0) {
      return {
        studentId,
        teamwork: 0,
        communication: 0,
        leadership: 0,
        creativity: 0,
        totalReviews: 0
      };
    }

    // Calculate averages
    const totals = reviews.reduce(
      (acc, review) => ({
        teamwork: acc.teamwork + review.teamwork,
        communication: acc.communication + review.communication,
        leadership: acc.leadership + review.leadership,
        creativity: acc.creativity + review.creativity
      }),
      { teamwork: 0, communication: 0, leadership: 0, creativity: 0 }
    );

    const count = reviews.length;

    return {
      studentId,
      teamwork: Math.round(totals.teamwork / count),
      communication: Math.round(totals.communication / count),
      leadership: Math.round(totals.leadership / count),
      creativity: Math.round(totals.creativity / count),
      totalReviews: count
    };
  }
}
