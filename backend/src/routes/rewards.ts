import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../prisma';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Multer for reward images
const uploadPath = path.resolve(process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'reward-' + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ─── ADMIN Routes ─────────────────────────────────────────────────────────────

// POST /rewards — create reward (admin)
router.post('/', authenticateToken, requireRole('admin'), upload.single('image'), async (req: AuthRequest, res: Response) => {
  const { title, description, pointRequired, stock } = req.body;
  if (!req.user) return res.status(401).json({ message: 'Tidak terotentikasi.' });

  if (!title || !pointRequired || !stock) {
    return res.status(400).json({ message: 'Judul, poin, dan stok wajib diisi.' });
  }

  try {
    const reward = await prisma.reward.create({
      data: {
        title,
        description: description || '',
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
        pointRequired: parseInt(pointRequired),
        stock: parseInt(stock),
        isActive: true,
        createdById: req.user.id,
      },
    });

    res.status(201).json({ message: 'Reward berhasil dibuat.', reward });
  } catch (error: any) {
    console.error('Error creating reward:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat membuat reward.' });
  }
});

// PUT /rewards/:id — update reward (admin)
router.put('/:id', authenticateToken, requireRole('admin'), upload.single('image'), async (req: AuthRequest, res: Response) => {
  const { title, description, pointRequired, stock, isActive } = req.body;

  try {
    const existing = await prisma.reward.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: 'Reward tidak ditemukan.' });

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (pointRequired !== undefined) updateData.pointRequired = parseInt(pointRequired);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;
    if (req.file) updateData.imageUrl = `/uploads/${req.file.filename}`;

    const reward = await prisma.reward.update({ where: { id: req.params.id }, data: updateData });

    res.json({ message: 'Reward berhasil diperbarui.', reward });
  } catch (error: any) {
    console.error('Error updating reward:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui reward.' });
  }
});

// GET /rewards/claims — list all claims (admin)
router.get('/claims', authenticateToken, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const claims = await prisma.rewardClaim.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, nim: true } },
        reward: { select: { id: true, title: true, pointRequired: true } },
      },
      orderBy: { claimedAt: 'desc' },
    });

    res.json({ claims });
  } catch (error: any) {
    console.error('Error fetching claims:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat memuat daftar klaim.' });
  }
});

// ─── STUDENT Routes ────────────────────────────────────────────────────────────

// GET /rewards — list active rewards (all authenticated users)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const rewards = await prisma.reward.findMany({
      where: { isActive: true },
      orderBy: { pointRequired: 'asc' },
    });

    res.json({ rewards });
  } catch (error: any) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat memuat daftar reward.' });
  }
});

// POST /rewards/:id/claim — claim reward (student)
router.post('/:id/claim', authenticateToken, requireRole('mahasiswa'), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (!req.user) return res.status(401).json({ message: 'Tidak terotentikasi.' });

  try {
    const [reward, student] = await Promise.all([
      prisma.reward.findUnique({ where: { id } }),
      prisma.user.findUnique({ where: { id: req.user.id } }),
    ]);

    if (!reward) return res.status(404).json({ message: 'Reward tidak ditemukan.' });
    if (!reward.isActive) return res.status(400).json({ message: 'Reward tidak aktif.' });
    if (reward.stock <= 0) return res.status(400).json({ message: 'Stok reward sudah habis.' });
    if (!student) return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    if (student.totalPoints < reward.pointRequired) {
      return res.status(400).json({
        message: `Poin tidak cukup. Anda membutuhkan ${reward.pointRequired} poin, saat ini memiliki ${student.totalPoints} poin.`,
      });
    }

    // Atomic transaction: deduct points + update stock + create claim + insert point_transaction
    const [updatedUser, updatedReward, claim] = await prisma.$transaction([
      prisma.user.update({
        where: { id: req.user.id },
        data: { totalPoints: { decrement: reward.pointRequired } },
      }),
      prisma.reward.update({
        where: { id },
        data: { stock: { decrement: 1 } },
      }),
      prisma.rewardClaim.create({
        data: {
          userId: req.user.id,
          rewardId: id,
          status: 'completed',
        },
      }),
      prisma.pointTransaction.create({
        data: {
          userId: req.user.id,
          type: 'redeem',
          amount: -reward.pointRequired,
          description: `Klaim reward: ${reward.title}`,
        },
      }),
    ]);

    res.json({
      message: `Reward "${reward.title}" berhasil diklaim! ${reward.pointRequired} poin telah dikurangi.`,
      claim,
      newTotalPoints: updatedUser.totalPoints,
    });
  } catch (error: any) {
    console.error('Error claiming reward:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengklaim reward.' });
  }
});

// GET /rewards/history — get claim history (student)
router.get('/history', authenticateToken, requireRole('mahasiswa'), async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Tidak terotentikasi.' });

  try {
    const claims = await prisma.rewardClaim.findMany({
      where: { userId: req.user.id },
      include: {
        reward: {
          select: { id: true, title: true, description: true, imageUrl: true, pointRequired: true },
        },
      },
      orderBy: { claimedAt: 'desc' },
    });

    res.json({ claims });
  } catch (error: any) {
    console.error('Error fetching claim history:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat memuat riwayat klaim.' });
  }
});

export default router;
