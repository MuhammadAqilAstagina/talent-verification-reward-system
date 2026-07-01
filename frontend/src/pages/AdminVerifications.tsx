import { useEffect, useState } from 'react';
import api from '../lib/api';
import { CheckSquare, CheckCircle, XCircle } from 'lucide-react';

interface Submission {
  id: string; title: string; category: string; subType: string;
  pointValue: number; status: string; createdAt: string;
  user: { id: string; name: string; email: string; nim?: string };
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export default function AdminVerifications() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');

  async function fetchSubmissions() {
    setLoading(true);
    try {
      const res = await api.get('/admin/submissions', { params: { status: statusFilter, limit: 50 } });
      setSubmissions(res.data.submissions);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchSubmissions(); }, [statusFilter]);

  async function handleApprove(id: string) {
    try {
      await api.post(`/admin/submissions/${id}/approve`);
      fetchSubmissions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyetujui.');
    }
  }

  async function handleReject(id: string) {
    const reason = prompt('Masukkan alasan penolakan:');
    if (!reason?.trim()) return;
    try {
      await api.post(`/admin/submissions/${id}/reject`, { reason });
      fetchSubmissions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menolak.');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white font-[Outfit] flex items-center gap-2">
          <CheckSquare size={22} className="text-primary-400" />
          Verifikasi Pengajuan
        </h1>
        <p className="text-slate-400 text-sm mt-1">Tinjau dan setujui atau tolak pengajuan mahasiswa.</p>
      </div>

      {/* Status filter */}
      <div className="flex gap-2">
        {['pending', 'approved', 'rejected'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 text-sm rounded-xl font-medium transition-all ${
              statusFilter === s
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : 'text-slate-400 border border-slate-800 hover:border-slate-700'
            }`}
          >
            {s === 'pending' ? '⏳ Pending' : s === 'approved' ? '✅ Disetujui' : '❌ Ditolak'}
          </button>
        ))}
      </div>

      {/* Submissions */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Memuat...</div>
        ) : submissions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Tidak ada pengajuan dengan status ini.</div>
        ) : (
          <div className="divide-y divide-slate-800">
            {submissions.map(s => (
              <div key={s.id} className="px-5 py-4 flex items-center gap-4 hover:bg-slate-800/40 transition-colors">
                <div className="text-xl flex-shrink-0">{s.category === 'sertifikat' ? '📜' : '💼'}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{s.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {s.user.name} ({s.user.nim}) · {s.subType} · {new Date(s.createdAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-amber-400 font-semibold">+{s.pointValue} pts</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColors[s.status]}`}>
                    {s.status === 'pending' ? 'Menunggu' : s.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                  </span>
                  {s.status === 'pending' && (
                    <>
                      <button
                        id={`approve-${s.id}`}
                        onClick={() => handleApprove(s.id)}
                        title="Setujui"
                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 transition-colors"
                      >
                        <CheckCircle size={13} /> Setujui
                      </button>
                      <button
                        id={`reject-${s.id}`}
                        onClick={() => handleReject(s.id)}
                        title="Tolak"
                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        <XCircle size={13} /> Tolak
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
