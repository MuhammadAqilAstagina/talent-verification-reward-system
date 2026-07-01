import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { Star, CheckSquare, Trophy, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Submission {
  id: string;
  title: string;
  category: string;
  subType: string;
  status: string;
  pointValue: number;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const statusLabels: Record<string, string> = {
  pending: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
};

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshUser();
    api.get('/submissions')
      .then((res) => setSubmissions(res.data.submissions.slice(0, 5)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const approved = submissions.filter(s => s.status === 'approved').length;
  const pending = submissions.filter(s => s.status === 'pending').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white font-[Outfit]">
          Selamat datang, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-slate-400 mt-1">Pantau perkembangan skill dan reward kamu di sini.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Star className="text-amber-400" size={20} />}
          label="Total Poin"
          value={user?.totalPoints ?? 0}
          bg="from-amber-500/10 to-amber-500/5"
          border="border-amber-500/20"
        />
        <StatCard
          icon={<Trophy className="text-primary-400" size={20} />}
          label="Ranking"
          value={user?.rank ? `#${user.rank}` : '—'}
          bg="from-primary-500/10 to-primary-500/5"
          border="border-primary-500/20"
        />
        <StatCard
          icon={<CheckSquare className="text-emerald-400" size={20} />}
          label="Disetujui"
          value={approved}
          bg="from-emerald-500/10 to-emerald-500/5"
          border="border-emerald-500/20"
        />
        <StatCard
          icon={<Clock className="text-blue-400" size={20} />}
          label="Menunggu"
          value={pending}
          bg="from-blue-500/10 to-blue-500/5"
          border="border-blue-500/20"
        />
      </div>

      {/* Recent submissions */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="font-bold text-white font-[Outfit] flex items-center gap-2">
            <TrendingUp size={18} className="text-primary-400" />
            Pengajuan Terbaru
          </h2>
          <Link to="/skills" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
            Lihat semua <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Memuat...</div>
        ) : submissions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500 mb-3">Belum ada pengajuan.</p>
            <Link
              to="/skills"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 text-primary-400 rounded-xl hover:bg-primary-500/20 transition-colors text-sm"
            >
              Tambah pengajuan pertama
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {submissions.map((s) => (
              <div key={s.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                <div>
                  <p className="text-sm font-medium text-white">{s.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {s.category === 'sertifikat' ? '📜' : '💼'} {s.subType} · {new Date(s.createdAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {s.status === 'approved' && (
                    <span className="text-xs text-amber-400 font-semibold">+{s.pointValue} pts</span>
                  )}
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColors[s.status]}`}>
                    {statusLabels[s.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickAction
          to="/skills"
          icon="📜"
          title="Tambah Sertifikat"
          desc="Daftarkan sertifikat baru"
          color="from-blue-500/10 to-blue-500/5 border-blue-500/20 hover:border-blue-500/40"
        />
        <QuickAction
          to="/portfolios"
          icon="💼"
          title="Tambah Portofolio"
          desc="Unggah portofolio terbaru"
          color="from-purple-500/10 to-purple-500/5 border-purple-500/20 hover:border-purple-500/40"
        />
        <QuickAction
          to="/rewards"
          icon="🎁"
          title="Tukar Reward"
          desc="Gunakan poinmu sekarang"
          color="from-amber-500/10 to-amber-500/5 border-amber-500/20 hover:border-amber-500/40"
        />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, bg, border }: any) {
  return (
    <div className={`glass-panel rounded-2xl p-5 bg-gradient-to-br ${bg} border ${border}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-400 font-medium">{label}</span>
        {icon}
      </div>
      <p className="text-2xl font-extrabold text-white font-[Outfit]">{value}</p>
    </div>
  );
}

function QuickAction({ to, icon, title, desc, color }: any) {
  return (
    <Link
      to={to}
      className={`glass-panel rounded-2xl p-5 bg-gradient-to-br border transition-all duration-200 hover:scale-[1.02] ${color}`}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <p className="font-semibold text-white text-sm">{title}</p>
      <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
    </Link>
  );
}
