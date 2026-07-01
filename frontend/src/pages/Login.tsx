import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      // Redirect based on role is handled in App.tsx
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login gagal. Periksa email dan password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-2xl shadow-lg shadow-primary-500/30 mb-4">
            <Trophy size={30} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white font-[Outfit]">TalentVerify</h1>
          <p className="text-slate-400 text-sm mt-1">Verifikasi Skill & Reward Sistem</p>
        </div>

        {/* Card */}
        <div className="glass-panel rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6 font-[Outfit]">Masuk ke Akun</h2>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                id="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Masukkan password"
                  className="w-full px-4 py-2.5 pr-11 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="login-button"
              className="w-full py-2.5 bg-gradient-to-r from-primary-500 to-indigo-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 glow-btn"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Belum punya akun?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
              Daftar sekarang
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
            <p className="text-xs font-medium text-slate-400 mb-2">Demo credentials:</p>
            <div className="space-y-1 text-xs text-slate-500">
              <p><span className="text-slate-400">Admin:</span> admin@example.com / Admin123!</p>
              <p><span className="text-slate-400">Student:</span> student@example.com / Student123!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
