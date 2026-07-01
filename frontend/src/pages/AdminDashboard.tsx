import { useEffect, useState } from 'react';
import api from '../lib/api';
import { LayoutDashboard, Users, Clock, CheckCircle, XCircle, Gift } from 'lucide-react';

interface Stats {
  totalStudents: number;
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  totalSubmissions: number;
  totalRewards: number;
  totalClaims: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white font-[Outfit] flex items-center gap-2">
          <LayoutDashboard size={22} className="text-primary-400" />
          Dashboard Admin
        </h1>
        <p className="text-slate-400 text-sm mt-1">Ringkasan statistik sistem verifikasi.</p>
      </div>

      {loading ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-500">Memuat statistik...</div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<Users size={20} className="text-blue-400" />} label="Total Mahasiswa" value={stats.totalStudents} color="border-blue-500/20 from-blue-500/10 to-blue-500/5" />
            <StatCard icon={<Clock size={20} className="text-amber-400" />} label="Pending" value={stats.totalPending} color="border-amber-500/20 from-amber-500/10 to-amber-500/5" highlight={stats.totalPending > 0} />
            <StatCard icon={<CheckCircle size={20} className="text-emerald-400" />} label="Disetujui" value={stats.totalApproved} color="border-emerald-500/20 from-emerald-500/10 to-emerald-500/5" />
            <StatCard icon={<XCircle size={20} className="text-red-400" />} label="Ditolak" value={stats.totalRejected} color="border-red-500/20 from-red-500/10 to-red-500/5" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel rounded-2xl p-5 col-span-1">
              <p className="text-sm text-slate-400 mb-1">Total Pengajuan</p>
              <p className="text-3xl font-extrabold text-white font-[Outfit]">{stats.totalSubmissions}</p>
              <div className="mt-4 space-y-2">
                <ProgressBar label="Disetujui" value={stats.totalApproved} total={stats.totalSubmissions} color="bg-emerald-500" />
                <ProgressBar label="Pending" value={stats.totalPending} total={stats.totalSubmissions} color="bg-amber-500" />
                <ProgressBar label="Ditolak" value={stats.totalRejected} total={stats.totalSubmissions} color="bg-red-500" />
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <Gift size={18} className="text-primary-400" />
                <p className="text-sm text-slate-400">Reward Aktif</p>
              </div>
              <p className="text-3xl font-extrabold text-white font-[Outfit]">{stats.totalRewards}</p>
            </div>

            <div className="glass-panel rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <Gift size={18} className="text-amber-400" />
                <p className="text-sm text-slate-400">Total Klaim Reward</p>
              </div>
              <p className="text-3xl font-extrabold text-white font-[Outfit]">{stats.totalClaims}</p>
            </div>
          </div>
        </>
      ) : (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-500">Gagal memuat data.</div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color, highlight }: any) {
  return (
    <div className={`glass-panel rounded-2xl p-5 bg-gradient-to-br border ${color} ${highlight ? 'ring-1 ring-amber-500/30' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-400 font-medium">{label}</span>
        {icon}
      </div>
      <p className="text-3xl font-extrabold text-white font-[Outfit]">{value}</p>
    </div>
  );
}

function ProgressBar({ label, value, total, color }: any) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
