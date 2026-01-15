import mongoose, { Document, Schema } from "mongoose";

export interface IConcept extends Document {
  name: string;
  code: string;
  moduleId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  description?: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  prerequisites: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ConceptSchema = new Schema<IConcept>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    moduleId: { type: Schema.Types.ObjectId, ref: "Module", required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    description: { type: String },
    difficulty: {
      type: String,
      enum: ["EASY", "MEDIUM", "HARD"],
      default: "MEDIUM",
    },
    prerequisites: [{ type: Schema.Types.ObjectId, ref: "Concept" }],
  },
  { timestamps: true }
);

ConceptSchema.index({ moduleId: 1, code: 1 }, { unique: true });

export const Concept = mongoose.model<IConcept>("Concept", ConceptSchema);
