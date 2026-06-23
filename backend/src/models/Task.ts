import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  projectId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  estimatedHours: number;
  deadline: Date;
  isCompleted: boolean;
  notes?: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  statusHistory: Array<{ action: string; timestamp: Date }>;
  notified: boolean;
}

const TaskSchema: Schema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true },
  description: { type: String },
  estimatedHours: { type: Number, required: true },
  deadline: { type: Date, required: true },
  isCompleted: { type: Boolean, default: false },
  notes: { type: String, default: '' },
  difficultyLevel: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  statusHistory: [{
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  notified: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<ITask>('Task', TaskSchema);
