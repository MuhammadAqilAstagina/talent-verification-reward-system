import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwttokenforauthdev123';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// REGISTER Route (Student only)
router.post('/register', async (req, res) => {
  const { name, email, password, nim, programStudi } = req.body;

  // Basic validation
  if (!name || !email || !password || !nim || !programStudi) {
    return res.status(400).json({ message: 'Semua kolom pendaftaran wajib diisi.' });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role: 'mahasiswa',
        nim,
        programStudi,
        totalPoints: 0,
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Pendaftaran berhasil.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        nim: user.nim,
        programStudi: user.programStudi,
        totalPoints: user.totalPoints,
      },
    });
  } catch (error: any) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat pendaftaran.' });
  }
});

// LOGIN Route (Student & Admin)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password wajib diisi.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login berhasil.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        nim: user.nim,
        programStudi: user.programStudi,
        totalPoints: user.totalPoints,
      },
    });
  } catch (error: any) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat login.' });
  }
});

// GET CURRENT USER ROUTE (/me)
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Tidak terotentikasi.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        nim: true,
        programStudi: true,
        avatarUrl: true,
        totalPoints: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    }

    let rank = null;

    if (user.role === 'mahasiswa') {
      // Calculate student ranking based on totalPoints descending
      const higherPointsCount = await prisma.user.count({
        where: {
          role: 'mahasiswa',
          totalPoints: {
            gt: user.totalPoints,
          },
        },
      });
      rank = higherPointsCount + 1;
    }

    res.json({
      user: {
        ...user,
        rank,
      },
    });
  } catch (error: any) {
    console.error('Error in /me:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

export default router;
