# Issue: Planning — MVP Talent Verification & Reward System

## 1. Konteks & Tujuan

Website **MVP (Minimum Viable Product)** bernama **Talent Verification & Reward System** yang memungkinkan mahasiswa mengajukan skill, sertifikat, dan portofolio untuk diverifikasi admin. Setiap pengajuan yang disetujui menghasilkan poin yang masuk ke leaderboard dan bisa ditukar dengan reward.

**Tujuan bisnis:** mendorong mahasiswa aktif mengumpulkan sertifikasi/portofolio melalui sistem gamifikasi poin & reward.

---

## 2. Tech Stack

| Layer | Pilihan |
|---|---|
| Frontend | React (Vite) + TailwindCSS |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (access token) |
| File Storage | Local disk / Docker volume (/uploads) |
| Containerization | Docker + docker-compose |

---

## 3. Data Model (ERD Ringkas)

### users
id, name, email, password_hash, role (admin|mahasiswa), nim, program_studi, avatar_url, total_points, created_at

### submissions
id, user_id (FK), category (sertifikat|portofolio), sub_type (enum), title, description, evidence_file_url, point_value, status (pending|approved|rejected), reject_reason, reviewed_by (FK), reviewed_at, created_at, updated_at

### point_transactions
id, user_id (FK), submission_id (FK nullable), type (earn|redeem), amount, description, created_at

### rewards
id, title, description, image_url, point_required, stock, is_active, created_by (FK), created_at

### reward_claims
id, user_id (FK), reward_id (FK), status (pending|processed|completed), claimed_at

---

## 4. Aturan Poin (Business Logic)

### Sertifikat
| Sub-type | Poin |
|---|---|
| lokal | 1 |
| regional | 3 |
| nasional | 5 |
| internasional | 10 |

### Portofolio
| Sub-type | Poin |
|---|---|
| personal | 2 |
| freelance | 5 |
| industri | 8 |
| juara_kompetisi | 10 |

### Aturan Perhitungan
- 	otal_point_mahasiswa = SUM(point) dari semua submission APPROVED.
- Saat admin **APPROVE** → insert point_transactions (type=earn) + increment users.total_points.
- Saat klaim reward → insert point_transactions (type=edeem) + decrement users.total_points.
- Klaim tidak bisa jika 	otal_points < point_required atau stock == 0.

---

## 5. Halaman (Pages)

### Public / Auth
- /login
- /register

### Mahasiswa
- /dashboard — ringkasan profil & poin
- /profile — edit profil
- /skills — list + form tambah sertifikat
- /portfolios — list + form tambah portofolio
- /leaderboard — ranking mahasiswa
- /rewards — katalog reward
- /rewards/history — riwayat klaim

### Admin
- /admin/dashboard — statistik
- /admin/students — data mahasiswa + search/filter
- /admin/students/:id — detail mahasiswa
- /admin/verifications — antrian verifikasi (pending)
- /admin/verifications/:id — detail + approve/reject
- /admin/rewards — kelola reward
- /admin/reward-claims — daftar klaim reward

---

## 6. Fitur Per Role

### Role: ADMIN
- [ ] Login & Logout
- [ ] Dashboard (stats: mahasiswa, submission pending/approved/rejected, grafik opsional)
- [ ] List mahasiswa dengan search/filter (nama, kategori, rentang poin)
- [ ] Detail mahasiswa (submission history + point history)
- [ ] Verifikasi submission: Approve (auto poin) / Reject (wajib isi alasan)
- [ ] CRUD reward (judul, deskripsi, gambar, poin, stok, aktif/nonaktif)
- [ ] Lihat daftar klaim reward

### Role: MAHASISWA
- [ ] Register & Login & Logout
- [ ] Edit profil (nama, foto, program studi)
- [ ] Tambah submission sertifikat (sub_type, judul, deskripsi, upload bukti)
- [ ] Tambah submission portofolio (sub_type, judul, deskripsi, upload bukti)
- [ ] Lihat status semua submission + alasan reject
- [ ] Submit ulang jika rejected
- [ ] Leaderboard (ranking + highlight posisi sendiri + filter program studi)
- [ ] Katalog reward (list aktif, klaim jika poin cukup & stok ada)
- [ ] Riwayat klaim reward

---

## 7. Sprint Planning

### Sprint 0 – Setup & Infrastruktur (2 hari)
- [ ] Init repo (monorepo: ackend/, rontend/, docs/)
- [ ] Scaffold backend: 
pm init, Express, Prisma, folder structure
- [ ] Scaffold frontend: 
pm create vite, TailwindCSS setup
- [ ] Buat Dockerfile untuk backend dan frontend
- [ ] Buat docker-compose.yml (postgres, backend, frontend, volume uploads)
- [ ] Buat .env.example
- [ ] Prisma schema + migration awal (semua tabel)
- [ ] Seed script: 1 admin default + 3 dummy rewards

### Sprint 1 – Auth & Submission (5 hari)
- [ ] Backend: POST /auth/register, POST /auth/login, JWT middleware, role guard
- [ ] Backend: CRUD submission (create, list, detail, update resubmit)
- [ ] Backend: Multer file upload ke /uploads, validasi mime & size
- [ ] Backend: Auto-assign point_value dari pointRules.js saat create submission
- [ ] Frontend: Halaman Login & Register
- [ ] Frontend: Halaman /skills & /portfolios (form + list status)
- [ ] Frontend: Student Dashboard (ringkasan poin + submission recents)

### Sprint 2 – Verifikasi & Poin (3 hari)
- [ ] Backend: GET /admin/submissions?status=pending
- [ ] Backend: POST /admin/submissions/:id/approve (point transaction EARN + increment total)
- [ ] Backend: POST /admin/submissions/:id/reject (store reject_reason)
- [ ] Frontend: Admin verification queue list
- [ ] Frontend: Admin verification detail + Approve/Reject buttons
- [ ] Unit test: point calculation logic

### Sprint 3 – Leaderboard & Reward (4 hari)
- [ ] Backend: GET /leaderboard (sorted by total_points, include rank)
- [ ] Backend: CRUD reward (admin)
- [ ] Backend: POST /rewards/:id/claim (validasi poin & stok, REDEEM transaction)
- [ ] Backend: GET /rewards/history (per mahasiswa)
- [ ] Frontend: Leaderboard page (highlight self, filter prodi)
- [ ] Frontend: Reward catalog + Claim button (disabled state)
- [ ] Frontend: Reward history page
- [ ] Frontend: Admin reward management UI

### Sprint 4 – Dashboard Admin & Polish (3 hari)
- [ ] Backend: GET /admin/dashboard (stats aggregation)
- [ ] Backend: GET /admin/students (list + search + filter)
- [ ] Backend: GET /admin/students/:id (detail + submissions + point history)
- [ ] Frontend: Admin dashboard UI (stat cards, optional chart)
- [ ] Frontend: Student management list + detail
- [ ] Frontend: Responsive audit (mobile, tablet, desktop)
- [ ] End-to-end test flow (register → submit → approve → leaderboard → claim)

### Sprint 5 – Deploy & Docs (2 hari)
- [ ] Swagger/OpenAPI spec di docs/
- [ ] README lengkap (run lokal, Docker, deploy, env vars, admin credentials)
- [ ] Deploy ke Railway/Render (atau VPS)
- [ ] Final QA

---

## 8. Deliverables

| # | Deliverable | Status |
|---|---|---|
| 1 | Source code rontend/ & ackend/ terpisah rapi | ⬜ |
| 2 | docker-compose.yml + Dockerfiles (docker-compose up --build) | ⬜ |
| 3 | Migration + Seed script (admin default + dummy rewards) | ⬜ |
| 4 | README.md (run lokal, Docker, deploy, env vars, default admin) | ⬜ |
| 5 | API documentation (Swagger atau Postman collection) | ⬜ |

---

## 9. Catatan Kritis

> ⚠️ Semua perubahan poin **wajib** tercatat di point_transactions — jangan hanya update kolom users.total_points tanpa histori.
>
> ⚠️ Validasi logika poin dan syarat klaim reward **hanya di backend** — jangan andalkan frontend.
>
> ✅ Gunakan satu file pointRules.js untuk mapping sub_type → poin.
>
> ✅ Gunakan DB transaction (Prisma $transaction) saat approve/claim agar data konsisten.
>
> ✅ Tulis komentar singkat di bagian logic poin & verifikasi — bagian bisnis paling kritis.

---

## 10. Environment Variables (.env.example)

`env
# Backend
DATABASE_URL=postgresql://user:password@localhost:5432/talent_mvp
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
PORT=4000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=5

# Frontend
VITE_API_URL=http://localhost:4000/api
`

---

## 11. Default Credentials (Seed)

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | Admin123! |
| Mahasiswa (demo) | student@example.com | Student123! |

---

*Last updated: 2026-07-02*
