-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'mahasiswa');

-- CreateEnum
CREATE TYPE "SubmissionCategory" AS ENUM ('sertifikat', 'portofolio');

-- CreateEnum
CREATE TYPE "SubmissionSubType" AS ENUM ('lokal', 'regional', 'nasional', 'internasional', 'personal', 'freelance', 'industri', 'juara_kompetisi');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('earn', 'redeem');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('pending', 'processed', 'completed');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'mahasiswa',
    "nim" TEXT,
    "program_studi" TEXT,
    "avatar_url" TEXT,
    "total_points" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" "SubmissionCategory" NOT NULL,
    "sub_type" "SubmissionSubType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidence_file_url" TEXT NOT NULL,
    "point_value" INTEGER NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'pending',
    "reject_reason" TEXT,
    "reviewed_by_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "point_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "submission_id" TEXT,
    "type" "TransactionType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rewards" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT,
    "point_required" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_claims" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reward_id" TEXT NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'completed',
    "claimed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reward_claims_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_claims" ADD CONSTRAINT "reward_claims_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_claims" ADD CONSTRAINT "reward_claims_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "rewards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
