import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './dbs/init.mongodb';
import aiRoutes from './routes/ai';
import projectRoutes from './routes/project';
import taskRoutes from './routes/task';
import authRoutes from './routes/auth';
import mentorRoutes from './routes/mentor';
import analyticsRoutes from './routes/analytics';
import notificationRoutes from './routes/notification';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

import User from './models/User';

// Connect to MongoDB
connectDB().then(() => {
  seedUser();
});

async function seedUser() {
  try {
    const user = await User.findOne({ email: 'mentor@example.com' });
    if (!user) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const seededUser = await User.create({
        name: 'Demo Mentor',
        email: 'mentor@example.com',
        password: hashedPassword,
        preferences: {
          workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          maxTasksPerDay: 3,
          availableHours: 2,
          learningSpeed: 'medium'
        }
      });
      console.log('Seeded demo user:', seededUser._id);
    } else {
      console.log('Demo user already exists:', user._id);
    }
  } catch (err: any) {
    console.error('Error seeding user:', err.message);
  }
}

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', aiRoutes);
app.use('/api', projectRoutes);
app.use('/api', taskRoutes);
app.use('/api', mentorRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', notificationRoutes);

app.get('/', (req, res) => {
  res.send('Personal Planner API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
