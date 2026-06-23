import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  goal: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  deadline?: Date;
  availableDailyTime: number;
  currentSkillLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredLearningSpeed: 'slow' | 'medium' | 'fast';
  roadmap?: string;
  estimatedDurationDays?: number;
  overallDifficulty?: 'easy' | 'medium' | 'hard';
}

const ProjectSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  goal: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
  deadline: { type: Date },
  availableDailyTime: { type: Number, default: 2 },
  currentSkillLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  preferredLearningSpeed: { type: String, enum: ['slow', 'medium', 'fast'], default: 'medium' },
  roadmap: { type: String },
  estimatedDurationDays: { type: Number },
  overallDifficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
}, { timestamps: true });

export default mongoose.model<IProject>('Project', ProjectSchema);
