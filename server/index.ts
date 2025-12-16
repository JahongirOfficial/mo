import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { connectDB } from './db';
import authRoutes from './routes/auth';
import categoryRoutes from './routes/categories';
import lessonRoutes from './routes/lessons';
import userRoutes from './routes/users';
import uploadRoutes from './routes/upload';
import sectionRoutes from './routes/sections';
import leadRoutes from './routes/leads';
import aiRoutes from './routes/ai';
import { authenticateToken, checkSubscription } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes); // Public - no auth required
app.use('/api/ai', authenticateToken, aiRoutes);
app.use('/api/sections', authenticateToken, sectionRoutes);
app.use('/api/categories', authenticateToken, categoryRoutes);
app.use('/api/lessons', authenticateToken, checkSubscription, lessonRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/upload', authenticateToken, uploadRoutes);

// Secure video streaming - only for subscribed users
app.use('/api/videos', authenticateToken, checkSubscription, (req, res, next) => {
  const videoPath = path.join(__dirname, '../uploads', req.path);
  res.sendFile(videoPath, (err) => {
    if (err) {
      res.status(404).json({ error: 'Video topilmadi' });
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server ishga tushdi: http://localhost:${PORT}`);
  console.log(`Network: http://0.0.0.0:${PORT}`);
});
