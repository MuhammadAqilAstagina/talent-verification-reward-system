import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { POINT_RULES, SubTypeType, getPointValue } from '../config/pointRules';

const router = Router();

// Ensure uploads directory exists
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const uploadPath = path.resolve(uploadDir);
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung. Hanya diperbolehkan PDF, JPG, JPEG, atau PNG.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// CREATE Submission (Student only)
router.post('/', authenticateToken, upload.single('evidence'), async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'mahasiswa') {
    return res.status(403).json({ message: 'Hanya mahasiswa yang dapat membuat pengajuan.' });
  }

  const { category, subType, title, description } = req.body;

  if (!category || !subType || !title || !description) {
    return res.status(400).json({ message: 'Kategori, Sub-tipe, Judul, dan Deskripsi wajib diisi.' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'File bukti (sertifikat/portofolio) wajib diunggah.' });
  }

  // Validate category and subType
  if (category !== 'sertifikat' && category !== 'portofolio') {
    return res.status(400).json({ message: 'Kategori harus berupa "sertifikat" atau "portofolio".' });
  }

  const pointValue = getPointValue(subType);
  if (pointValue === 0) {
    return res.status(400).json({ message: 'Sub-tipe pengajuan tidak valid.' });
  }

  try {
    // Save relative URL or path to access the file
    const evidenceFileUrl = `/uploads/${req.file.filename}`;

    const submission = await prisma.submission.create({
      data: {
        userId: req.user.id,
        category: category === 'sertifikat' ? 'sertifikat' : 'portofolio',
        subType: subType as SubTypeType,
        title,
        description,
        evidenceFileUrl,
        pointValue,
        status: 'pending',
      },
    });

    res.status(201).json({
      message: 'Pengajuan berhasil dibuat dan sedang menunggu verifikasi admin.',
      submission,
    });
  } catch (error: any) {
    console.error('Error creating submission:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat membuat pengajuan.' });
  }
});

// LIST Submissions of current student
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Tidak terotentikasi.' });
  }

  try {
    const submissions = await prisma.submission.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ submissions });
  } catch (error: any) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat memuat pengajuan.' });
  }
});

// GET Submission Details
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Tidak terotentikasi.' });
  }

  try {
    const submission = await prisma.submission.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            nim: true,
            programStudi: true,
          },
        },
      },
    });

    if (!submission) {
      return res.status(404).json({ message: 'Pengajuan tidak ditemukan.' });
    }

    // Students can only view their own submissions. Admins can view any.
    if (req.user.role !== 'admin' && submission.userId !== req.user.id) {
      return res.status(403).json({ message: 'Akses ditolak.' });
    }

    res.json({ submission });
  } catch (error: any) {
    console.error('Error fetching submission details:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

// RESUBMIT Rejected Submission
router.put('/:id', authenticateToken, upload.single('evidence'), async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'mahasiswa') {
    return res.status(403).json({ message: 'Akses ditolak.' });
  }

  const { title, description, subType } = req.body;

  try {
    const existingSubmission = await prisma.submission.findUnique({
      where: { id: req.params.id },
    });

    if (!existingSubmission) {
      return res.status(404).json({ message: 'Pengajuan tidak ditemukan.' });
    }

    if (existingSubmission.userId !== req.user.id) {
      return res.status(403).json({ message: 'Akses ditolak. Pengajuan bukan milik Anda.' });
    }

    if (existingSubmission.status !== 'rejected') {
      return res.status(400).json({ message: 'Hanya pengajuan dengan status "rejected" yang dapat diajukan ulang.' });
    }

    // Prepare update data
    const updateData: any = {
      title: title || existingSubmission.title,
      description: description || existingSubmission.description,
      status: 'pending',
      rejectReason: null, // Clear reject reason
      reviewedById: null,
      reviewedAt: null,
    };

    if (subType) {
      const pointValue = getPointValue(subType);
      if (pointValue === 0) {
        return res.status(400).json({ message: 'Sub-tipe pengajuan tidak valid.' });
      }
      updateData.subType = subType as SubTypeType;
      updateData.pointValue = pointValue;
    }

    if (req.file) {
      updateData.evidenceFileUrl = `/uploads/${req.file.filename}`;
      
      // Optionally delete the old file
      const oldFilePath = path.join(uploadPath, path.basename(existingSubmission.evidenceFileUrl));
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    const updatedSubmission = await prisma.submission.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({
      message: 'Pengajuan berhasil diperbarui dan dikirim ulang untuk verifikasi.',
      submission: updatedSubmission,
    });
  } catch (error: any) {
    console.error('Error resubmitting:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat memperbarui pengajuan.' });
  }
});

// DELETE Submission (Only allowed if pending or rejected)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'mahasiswa') {
    return res.status(403).json({ message: 'Akses ditolak.' });
  }

  try {
    const submission = await prisma.submission.findUnique({
      where: { id: req.params.id },
    });

    if (!submission) {
      return res.status(404).json({ message: 'Pengajuan tidak ditemukan.' });
    }

    if (submission.userId !== req.user.id) {
      return res.status(403).json({ message: 'Akses ditolak. Pengajuan bukan milik Anda.' });
    }

    if (submission.status === 'approved') {
      return res.status(400).json({ message: 'Pengajuan yang sudah disetujui tidak dapat dihapus.' });
    }

    // Delete database entry
    await prisma.submission.delete({
      where: { id: req.params.id },
    });

    // Delete physical file
    const filePath = path.join(uploadPath, path.basename(submission.evidenceFileUrl));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'Pengajuan berhasil dihapus.' });
  } catch (error: any) {
    console.error('Error deleting submission:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat menghapus pengajuan.' });
  }
});

// Handle Multer limit error helper
router.use((err: any, req: any, res: Response, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File terlalu besar. Ukuran maksimal adalah 5MB.' });
    }
  }
  if (err.message) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: 'Terjadi kesalahan pada upload file.' });
});

export default router;
