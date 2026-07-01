import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwttokenforauthdev123';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'mahasiswa';
  };
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Token otentikasi tidak ditemukan.' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Token tidak valid atau kedaluwarsa.' });
    }
    
    req.user = user as { id: string; email: string; role: 'admin' | 'mahasiswa' };
    next();
  });
}

export function requireRole(role: 'admin' | 'mahasiswa') {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Tidak terotentikasi.' });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Akses ditolak. Peran tidak sesuai.' });
    }

    next();
  };
}
