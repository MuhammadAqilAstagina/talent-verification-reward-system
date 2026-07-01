import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticateToken);
router.use(requireRole('admin'));

// GET /admin/submissions?status=pending|approved|rejected (verification queue)
router.get('/submissions', async (req: AuthRequest, res: Response) => {
  const { status, page = '1', limit = '20' } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  try {
    const where: any = {};
    if (status) where.status = status;

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, nim: true, programStudi: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.submission.count({ where }),
    ]);

    res.json({ submissions, total, page: parseInt(page as string), limit: parseInt(limit as string) });
  } catch (error: any) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat memuat daftar pengajuan.' });
  }
});

// POST /admin/submissions/:id/approve
router.post('/submissions/:id/approve', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (!req.user) return res.status(401).json({ message: 'Tidak terotentikasi.' });

  try {
    const submission = await prisma.submission.findUnique({ where: { id } });

    if (!submission) return res.status(404).json({ message: 'Pengajuan tidak ditemukan.' });
    if (submission.status !== 'pending') {
      return res.status(400).json({ message: 'Hanya pengajuan dengan status pending yang dapat disetujui.' });
    }

    // Atomic transaction: update submission + user points + insert point_transaction
    const result = await prisma.$transaction([
      prisma.submission.update({
        where: { id },
        data: {
          status: 'approved',
          reviewedById: req.user.id,
          reviewedAt: new Date(),
        },
      }),
      prisma.user.update({
        where: { id: submission.userId },
        data: { totalPoints: { increment: submission.pointValue } },
      }),
      prisma.pointTransaction.create({
        data: {
          userId: submission.userId,
          submissionId: submission.id,
          type: 'earn',
          amount: submission.pointValue,
          description: `Poin dari pengajuan: ${submission.title} (${submission.subType})`,
        },
      }),
    ]);

    res.json({
      message: `Pengajuan disetujui. ${submission.pointValue} poin ditambahkan ke akun mahasiswa.`,
      submission: result[0],
    });
  } catch (error: any) {
    console.error('Error approving submission:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menyetujui pengajuan.' });
  }
});

// POST /admin/submissions/:id/reject
router.post('/submissions/:id/reject', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  if (!req.user) return res.status(401).json({ message: 'Tidak terotentikasi.' });

  if (!reason || reason.trim() === '') {
    return res.status(400).json({ message: 'Alasan penolakan wajib diisi.' });
  }

  try {
    const submission = await prisma.submission.findUnique({ where: { id } });

    if (!submission) return res.status(404).json({ message: 'Pengajuan tidak ditemukan.' });
    if (submission.status !== 'pending') {
      return res.status(400).json({ message: 'Hanya pengajuan dengan status pending yang dapat ditolak.' });
    }

    const updated = await prisma.submission.update({
      where: { id },
      data: {
        status: 'rejected',
        rejectReason: reason.trim(),
        reviewedById: req.user.id,
        reviewedAt: new Date(),
      },
    });

    res.json({ message: 'Pengajuan berhasil ditolak.', submission: updated });
  } catch (error: any) {
    console.error('Error rejecting submission:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menolak pengajuan.' });
  }
});

// GET /admin/students — list all students with optional search/filter
router.get('/students', async (req: AuthRequest, res: Response) => {
  const { search, minPoints, maxPoints, page = '1', limit = '20' } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  try {
    const where: any = { role: 'mahasiswa' };

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { nim: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (minPoints !== undefined || maxPoints !== undefined) {
      where.totalPoints = {};
      if (minPoints !== undefined) where.totalPoints.gte = parseInt(minPoints as string);
      if (maxPoints !== undefined) where.totalPoints.lte = parseInt(maxPoints as string);
    }

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          nim: true,
          programStudi: true,
          totalPoints: true,
          avatarUrl: true,
          createdAt: true,
          _count: { select: { submissions: true } },
        },
        orderBy: { totalPoints: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ students, total, page: parseInt(page as string), limit: parseInt(limit as string) });
  } catch (error: any) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat memuat daftar mahasiswa.' });
  }
});

// GET /admin/students/:id — detail with submission + point history
router.get('/students/:id', async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.user.findUnique({
      where: { id: req.params.id, role: 'mahasiswa' },
      include: {
        submissions: { orderBy: { createdAt: 'desc' } },
        pointTransactions: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!student) return res.status(404).json({ message: 'Mahasiswa tidak ditemukan.' });

    const { passwordHash, ...safeStudent } = student;
    res.json({ student: safeStudent });
  } catch (error: any) {
    console.error('Error fetching student detail:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat memuat detail mahasiswa.' });
  }
});

// GET /admin/dashboard — aggregate stats
router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalStudents,
      totalPending,
      totalApproved,
      totalRejected,
      totalRewards,
      totalClaims,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'mahasiswa' } }),
      prisma.submission.count({ where: { status: 'pending' } }),
      prisma.submission.count({ where: { status: 'approved' } }),
      prisma.submission.count({ where: { status: 'rejected' } }),
      prisma.reward.count(),
      prisma.rewardClaim.count(),
    ]);

    res.json({
      totalStudents,
      totalPending,
      totalApproved,
      totalRejected,
      totalRewards,
      totalClaims,
      totalSubmissions: totalPending + totalApproved + totalRejected,
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat memuat statistik dashboard.' });
  }
});

export default router;
