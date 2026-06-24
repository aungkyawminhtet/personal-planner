import mongoose, { Schema, Document } from 'mongoose';

export interface IMentorAdvice extends Document {
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  role: 'user' | 'mentor';
  message: string;
  createdAt: Date;
}

const MentorAdviceSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: false },
  role: { type: String, enum: ['user', 'mentor'], required: true },
  message: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<IMentorAdvice>('MentorAdvice', MentorAdviceSchema);
