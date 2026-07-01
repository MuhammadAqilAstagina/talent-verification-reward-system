import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /leaderboard — public, sorted by total points
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '50', programStudi } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  try {
    const where: any = { role: 'mahasiswa' };
    if (programStudi) where.programStudi = { contains: programStudi as string, mode: 'insensitive' };

    const students = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        nim: true,
        programStudi: true,
        avatarUrl: true,
        totalPoints: true,
      },
      orderBy: { totalPoints: 'desc' },
      skip,
      take: parseInt(limit as string),
    });

    // Attach rank numbers
    const rankedStudents = students.map((s, index) => ({
      ...s,
      rank: skip + index + 1,
    }));

    res.json({ leaderboard: rankedStudents });
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat memuat leaderboard.' });
  }
});

export default router;
