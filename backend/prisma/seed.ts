import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Hash passwords
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
  const studentPasswordHash = await bcrypt.hash('Student123!', 10);

  // 1. Create Default Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Default Admin',
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
    },
  });
  console.log(`Created admin: ${admin.email}`);

  // 2. Create Demo Student
  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      name: 'Demo Student',
      email: 'student@example.com',
      passwordHash: studentPasswordHash,
      role: 'mahasiswa',
      nim: '123456789',
      programStudi: 'Teknik Informatika',
      totalPoints: 0,
    },
  });
  console.log(`Created student: ${student.email}`);

  // 3. Create Basic Rewards
  const rewards = [
    {
      title: 'Stiker Laptop Antigravity',
      description: 'Stiker eksklusif dengan logo Antigravity untuk menghias laptop Anda.',
      pointRequired: 5,
      stock: 50,
      isActive: true,
      createdById: admin.id,
    },
    {
      title: 'Gantungan Kunci Kampus',
      description: 'Gantungan kunci elegan dengan bahan akrilik tebal.',
      pointRequired: 10,
      stock: 20,
      isActive: true,
      createdById: admin.id,
    },
    {
      title: 'T-Shirt Talent MVP',
      description: 'Kaos berkualitas premium dengan desain keren khusus Talent Verification & Reward System.',
      pointRequired: 25,
      stock: 15,
      isActive: true,
      createdById: admin.id,
    },
    {
      title: 'Voucher Kopi Kantin Rp 50.000',
      description: 'Voucher kopi gratis di kantin Fakultas Teknik.',
      pointRequired: 15,
      stock: 30,
      isActive: true,
      createdById: admin.id,
    },
  ];

  for (const r of rewards) {
    const createdReward = await prisma.reward.create({
      data: r,
    });
    console.log(`Created reward: ${createdReward.title} (${createdReward.pointRequired} Points)`);
  }

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
