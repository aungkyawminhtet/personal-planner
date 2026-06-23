import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  preferences: {
    workDays: string[];
    maxTasksPerDay: number;
    availableHours: number;
    learningSpeed: 'slow' | 'medium' | 'fast';
  };
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  preferences: {
    workDays: { type: [String], default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] },
    maxTasksPerDay: { type: Number, default: 3 },
    availableHours: { type: Number, default: 2 },
    learningSpeed: { type: String, enum: ['slow', 'medium', 'fast'], default: 'medium' }
  }
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
