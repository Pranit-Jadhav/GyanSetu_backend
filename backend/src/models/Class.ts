import mongoose, { Document, Schema } from 'mongoose';

export interface IClass extends Document {
  name: string;
  academicYear: string;
  course: string;
  teacherId: mongoose.Types.ObjectId;
  students: mongoose.Types.ObjectId[];
  joinCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClassSchema = new Schema<IClass>(
  {
    name: { type: String, required: true },
    academicYear: { type: String, required: true },
    course: { type: String, required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    students: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    joinCode: { type: String, unique: true, index: true } // Not required - generated in pre-save hook
  },
  { timestamps: true }
);

// Generate unique join code before save
ClassSchema.pre('save', async function (next) {
  // Only generate joinCode if it doesn't exist (for new documents)
  if (!this.joinCode) {
    let code: string;
    let exists = true;
    let attempts = 0;
    const maxAttempts = 10; // Prevent infinite loop
    
    while (exists && attempts < maxAttempts) {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existingClass = await mongoose.model('Class').findOne({ joinCode: code });
      exists = !!existingClass;
      attempts++;
    }
    
    if (attempts >= maxAttempts) {
      return next(new Error('Failed to generate unique join code'));
    }
    
    this.joinCode = code;
  }
  next();
});

export const Class = mongoose.model<IClass>('Class', ClassSchema);
