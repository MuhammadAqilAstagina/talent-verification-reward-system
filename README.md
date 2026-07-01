# 🏆 Talent Verification & Reward System MVP

A Minimum Viable Product (MVP) web application that enables students to submit skills, certificates, and portfolios for admin verification. Approved submissions grant points that feed a leaderboard and can be redeemed for rewards.

---

## 🛠 Tech Stack

- **Frontend:** React (Vite) + TailwindCSS (v3) + Lucide Icons + Axios
- **Backend:** Node.js + Express + TypeScript + Prisma ORM + Multer (File Uploads)
- **Database:** PostgreSQL
- **Environment:** Docker & Docker Compose

---

## 🚀 Quick Start (Running with Docker)

The easiest way to run the entire stack (Database, Backend, Frontend) is using Docker Compose.

### Prerequisites
- Docker & Docker Compose installed and running.

### Steps
1. Clone the repository and navigate to the project root.
2. Build and start the containers in detached mode:
   ```bash
   docker-compose up --build -d
   ```
3. Run migrations and seed data on the host (or wait for automatic generator):
   *Note: Since the database maps port `5435` to the host, you can run migrations directly from the root using local Prisma CLI:*
   ```bash
   cd backend
   npm install
   npx prisma migrate dev --name init
   npm run seed
   ```
4. Access the web applications:
   - **Frontend portal:** [http://localhost:5173](http://localhost:5173)
   - **Backend API:** [http://localhost:4000/api](http://localhost:4000/api)
   - **Backend Healthcheck:** [http://localhost:4000/api/health](http://localhost:4000/api/health)

---

## 💻 Local Development (Running without Docker)

If you prefer to run services individually without Docker:

### 1. Database Setup
Ensure you have a PostgreSQL instance running locally. Create a database called `talent_db`.

### 2. Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create your `.env` file from `.env.example` or keep the default local configurations:
   ```env
   PORT=4000
   DATABASE_URL=postgresql://postgres:postgres123@localhost:5435/talent_db?schema=public
   JWT_SECRET=supersecretjwttokenforauthdev123
   JWT_EXPIRES_IN=7d
   UPLOAD_DIR=uploads
   MAX_FILE_SIZE_MB=5
   ```
3. Install dependencies, execute migrations, seed database, and launch development server:
   ```bash
   npm install
   npx prisma migrate dev --name init
   npm run seed
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies and start the Vite development server:
   ```bash
   npm install
   npm run dev
   ```
3. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Default Credentials (Seed Data)

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@example.com` | `Admin123!` |
| **Mahasiswa (Student)** | `student@example.com` | `Student123!` |

---

## 💡 Point Assignment Rules

Points are automatically assigned to student submissions based on category and sub-type when approved by an admin:

### 📜 Certificate Categories
- **Lokal:** 1 Point
- **Regional:** 3 Points
- **Nasional:** 5 Points
- **Internasional:** 10 Points

### 💼 Portfolio Categories
- **Personal:** 2 Points
- **Freelance:** 5 Points
- **Industri:** 8 Points
- **Juara Kompetisi:** 10 Points

---

## 📂 Project Structure

```
mvp/
├── docs/
│   └── swagger.yaml          # OpenAPI Specifications
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma     # Prisma DB Schema
│   │   └── seed.ts           # Seeding script
│   ├── src/
│   │   ├── config/           # Business/Point Rules configs
│   │   ├── middleware/       # JWT Auth and Role guards
│   │   ├── routes/           # REST Route Handlers (auth, admin, rewards, etc.)
│   │   └── index.ts          # Server entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # Layouts, Sidebar, ProtectedRoute guard
│   │   ├── contexts/         # AuthContext
│   │   ├── lib/              # Axios instance configuration
│   │   ├── pages/            # View Pages (Login, Register, Leaderboard, etc.)
│   │   └── App.tsx           # Route configurations
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## ☁️ Online Deployment Instructions

### Deploying the Database
Deploy a PostgreSQL instance on a provider like **Supabase**, **Neon**, **Render**, or **Railway**. Retrieve the database connection URI string.

### Deploying the Backend (API)
You can deploy the backend to **Render**, **Railway**, or a **VPS** container:
1. Set up the environment variables on your provider:
   - `DATABASE_URL` (your online Postgres connection string)
   - `JWT_SECRET` (generate a secure random string)
   - `PORT=4000` (or let the platform bind it)
   - `UPLOAD_DIR=uploads`
2. Ensure you run the Prisma generation step in your build command:
   ```bash
   npx prisma generate && npx prisma migrate deploy && node dist/index.js
   ```
3. Make sure the backend serves `/uploads` directory for uploads. (For production on multiple instances, switch from local Multer storage to cloud storage like AWS S3 or Cloudinary).

### Deploying the Frontend (SPA)
Deploy the React single-page app to **Vercel**, **Netlify**, or **Render**:
1. Configure the build command: `npm run build`.
2. Configure the output directory: `dist`.
3. Set the environment variable:
   - `VITE_API_URL` pointing to your deployed backend URL (e.g. `https://your-backend.railway.app/api`).
