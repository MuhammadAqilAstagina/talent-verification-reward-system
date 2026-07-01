import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

// Auth pages
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';

// Student pages
import Dashboard from './pages/Dashboard';
import SubmissionsPage from './pages/Submissions';
import Leaderboard from './pages/Leaderboard';
import Rewards from './pages/Rewards';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';
import AdminStudents from './pages/AdminStudents';
import AdminStudentDetail from './pages/AdminStudentDetail';
import AdminVerifications from './pages/AdminVerifications';
import AdminRewards from './pages/AdminRewards';

function RootRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Student routes */}
          <Route element={<ProtectedRoute role="mahasiswa"><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/skills" element={<SubmissionsPage category="sertifikat" />} />
            <Route path="/portfolios" element={<SubmissionsPage category="portofolio" />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/rewards" element={<Rewards />} />
          </Route>

          {/* Admin routes */}
          <Route element={<ProtectedRoute role="admin"><AppLayout /></ProtectedRoute>}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<AdminStudents />} />
            <Route path="/admin/students/:id" element={<AdminStudentDetail />} />
            <Route path="/admin/verifications" element={<AdminVerifications />} />
            <Route path="/admin/rewards" element={<AdminRewards />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
