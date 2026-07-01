import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { ArrowLeft, Star, CheckCircle, XCircle } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export default function AdminStudentDetail() {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'submissions' | 'points'>('submissions');

  useEffect(() => {
    api.get(`/admin/students/${id}`)
      .then(res => setStudent(res.data.student))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="glass-panel rounded-2xl p-12 text-center text-slate-500">Memuat...</div>;
  if (!student) return <div className="glass-panel rounded-2xl p-12 text-center text-red-400">Mahasiswa tidak ditemukan.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/students" className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition-colors">
          <ArrowLeft size={16} /> Kembali
        </Link>
      </div>

      {/* Profile card */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
            {student.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white font-[Outfit]">{student.name}</h1>
            <p className="text-slate-400 text-sm">{student.email}</p>
            <p className="text-slate-500 text-xs mt-0.5">{student.nim} · {student.programStudi}</p>
          </div>
          <div className="ml-auto text-right">
            <div className="flex items-center gap-2">
              <Star size={18} className="text-amber-400" />
              <p className="text-2xl font-extrabold text-amber-400 font-[Outfit]">{student.totalPoints}</p>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Total Poin</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-800 rounded-xl w-fit">
        {(['submissions', 'points'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === t ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            {t === 'submissions' ? '📋 Pengajuan' : '⭐ Riwayat Poin'}
          </button>
        ))}
      </div>

      {tab === 'submissions' ? (
        <div className="space-y-3">
          {student.submissions.length === 0
            ? <div className="glass-panel rounded-2xl p-12 text-center text-slate-500">Belum ada pengajuan.</div>
            : student.submissions.map((s: any) => (
              <div key={s.id} className="glass-panel rounded-xl p-4 flex items-center gap-4">
                <div className="text-xl">{s.category === 'sertifikat' ? '📜' : '💼'}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{s.title}</p>
                  <p className="text-xs text-slate-500">{s.subType} · {new Date(s.createdAt).toLocaleDateString('id-ID')}</p>
                </div>
                <div className="flex items-center gap-2">
                  {s.status === 'approved' && <span className="text-xs text-amber-400 font-semibold">+{s.pointValue} pts</span>}
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColors[s.status]}`}>
                    {s.status === 'pending' ? 'Menunggu' : s.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                  </span>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="space-y-3">
          {student.pointTransactions.length === 0
            ? <div className="glass-panel rounded-2xl p-12 text-center text-slate-500">Belum ada transaksi poin.</div>
            : student.pointTransactions.map((t: any) => (
              <div key={t.id} className="glass-panel rounded-xl p-4 flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type === 'earn' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                  {t.type === 'earn' ? <CheckCircle size={16} className="text-emerald-400" /> : <XCircle size={16} className="text-red-400" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">{t.description}</p>
                  <p className="text-xs text-slate-500">{new Date(t.createdAt).toLocaleDateString('id-ID')}</p>
                </div>
                <span className={`font-bold text-sm ${t.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {t.amount > 0 ? '+' : ''}{t.amount} pts
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
