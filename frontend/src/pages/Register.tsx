import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Eye, EyeOff, Loader2 } from 'lucide-react';

const PROGRAM_STUDI = [
  'Teknik Informatika',
  'Sistem Informasi',
  'Ilmu Komputer',
  'Teknik Komputer',
  'Teknik Elektro',
  'Manajemen',
  'Akuntansi',
  'Lainnya',
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', nim: '', programStudi: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      return setError('Password dan konfirmasi password tidak cocok.');
    }
    if (form.password.length < 8) {
      return setError('Password minimal 8 karakter.');
    }

    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        nim: form.nim,
        programStudi: form.programStudi,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Pendaftaran gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-2xl shadow-lg shadow-primary-500/30 mb-3">
            <Trophy size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white font-[Outfit]">TalentVerify</h1>
          <p className="text-slate-400 text-sm mt-1">Buat Akun Mahasiswa</p>
        </div>

        <div className="glass-panel rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6 font-[Outfit]">Daftar Akun</h2>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nama kamu"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">NIM</label>
                <input
                  type="text"
                  id="nim"
                  required
                  value={form.nim}
                  onChange={(e) => setForm({ ...form, nim: e.target.value })}
                  placeholder="Nomor Induk Mahasiswa"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Program Studi</label>
              <select
                id="programStudi"
                required
                value={form.programStudi}
                onChange={(e) => setForm({ ...form, programStudi: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              >
                <option value="" disabled>Pilih Program Studi</option>
                {PROGRAM_STUDI.map((p) => (
                  <option key={p} value={p} className="bg-slate-800">{p}</option>
                ))}
              </select>
            </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 8 karakter"
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
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Konfirmasi Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Ulangi password"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              id="register-button"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-primary-500 to-indigo-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 glow-btn mt-2"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? 'Mendaftarkan...' : 'Buat Akun'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
