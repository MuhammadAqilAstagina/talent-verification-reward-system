import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import prisma from './prisma';
import authRouter from './routes/auth';
import submissionsRouter from './routes/submissions';
import adminRouter from './routes/admin';
import rewardsRouter from './routes/rewards';
import leaderboardRouter from './routes/leaderboard';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount routers
app.use('/api/auth', authRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/rewards', rewardsRouter);
app.use('/api/leaderboard', leaderboardRouter);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'OK',
      message: 'Server is healthy and database is connected.',
      timestamp: new Date(),
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Server is running but database connection failed.',
      error: error.message || error,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received. Closing Prisma and server.');
  await prisma.$disconnect();
  process.exit(0);
});
