import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Plus, Upload, X, FileText, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';

const SERTIFIKAT_TYPES = [
  { value: 'lokal', label: 'Lokal', points: 1 },
  { value: 'regional', label: 'Regional', points: 3 },
  { value: 'nasional', label: 'Nasional', points: 5 },
  { value: 'internasional', label: 'Internasional', points: 10 },
];

const PORTOFOLIO_TYPES = [
  { value: 'personal', label: 'Personal', points: 2 },
  { value: 'freelance', label: 'Freelance', points: 5 },
  { value: 'industri', label: 'Industri', points: 8 },
  { value: 'juara_kompetisi', label: 'Juara Kompetisi', points: 10 },
];

const statusIcon: Record<string, JSX.Element> = {
  pending: <Clock size={14} className="text-amber-400" />,
  approved: <CheckCircle size={14} className="text-emerald-400" />,
  rejected: <XCircle size={14} className="text-red-400" />,
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const statusLabels: Record<string, string> = {
  pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak',
};

interface Submission {
  id: string; title: string; description: string; category: string;
  subType: string; status: string; pointValue: number; rejectReason?: string;
  evidenceFileUrl: string; createdAt: string;
}

interface SubmissionsPageProps {
  category: 'sertifikat' | 'portofolio';
}

export default function SubmissionsPage({ category }: SubmissionsPageProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [resubmitId, setResubmitId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', subType: '' });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const types = category === 'sertifikat' ? SERTIFIKAT_TYPES : PORTOFOLIO_TYPES;
  const title = category === 'sertifikat' ? 'Sertifikat' : 'Portofolio';

  async function fetchSubmissions() {
    setLoading(true);
    try {
      const res = await api.get('/submissions');
      setSubmissions(res.data.submissions.filter((s: Submission) => s.category === category));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchSubmissions(); }, [category]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file && !resubmitId) return setError('File bukti wajib diunggah.');
    if (!form.subType) return setError('Pilih jenis pengajuan.');

    const formData = new FormData();
    if (!resubmitId) formData.append('category', category);
    formData.append('subType', form.subType);
    formData.append('title', form.title);
    formData.append('description', form.description);
    if (file) formData.append('evidence', file);

    setSubmitting(true);
    setError('');
    try {
      if (resubmitId) {
        await api.put(`/submissions/${resubmitId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/submissions', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setSuccess(`${title} berhasil ${resubmitId ? 'diperbarui' : 'diajukan'} untuk verifikasi.`);
      setShowForm(false);
      setResubmitId(null);
      setForm({ title: '', description: '', subType: '' });
      setFile(null);
      fetchSubmissions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  }

  function openResubmit(s: Submission) {
    setResubmitId(s.id);
    setForm({ title: s.title, description: s.description, subType: s.subType });
    setFile(null);
    setShowForm(true);
    setError('');
  }

  const selectedType = types.find(t => t.value === form.subType);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-[Outfit]">
            {category === 'sertifikat' ? '📜' : '💼'} {title}
          </h1>
          <p className="text-slate-400 text-sm mt-1">Kelola pengajuan {title.toLowerCase()} kamu.</p>
        </div>
        <button
          id={`add-${category}-btn`}
          onClick={() => { setShowForm(true); setResubmitId(null); setForm({ title: '', description: '', subType: '' }); setError(''); }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all glow-btn"
        >
          <Plus size={16} /> Tambah {title}
        </button>
      </div>

      {success && (
        <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center justify-between">
          {success}
          <button onClick={() => setSuccess('')}><X size={16} /></button>
        </div>
      )}

      {/* Submission Form */}
      {showForm && (
        <div className="glass-panel rounded-2xl p-6 border border-primary-500/20">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-white font-[Outfit]">
              {resubmitId ? 'Ajukan Ulang' : `Tambah ${title}`}
            </h2>
            <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Jenis {title}</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {types.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setForm({ ...form, subType: t.value })}
                    className={`p-3 rounded-xl border text-center transition-all duration-200 ${
                      form.subType === t.value
                        ? 'border-primary-500 bg-primary-500/20 text-primary-300'
                        : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <p className="text-sm font-medium">{t.label}</p>
                    <p className="text-xs text-amber-400 mt-0.5">+{t.points} pts</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Judul</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={`Judul ${title}`}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Deskripsi</label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Deskripsi singkat tentang sertifikat/portofolio ini"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                File Bukti {resubmitId && <span className="text-slate-500">(kosongkan jika tidak ingin mengubah)</span>}
              </label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-primary-500 transition-colors bg-slate-800/30">
                <Upload size={24} className="text-slate-500 mb-2" />
                {file ? (
                  <p className="text-sm text-primary-400">{file.name}</p>
                ) : (
                  <p className="text-sm text-slate-500">Klik untuk upload (PDF, JPG, PNG — maks 5MB)</p>
                )}
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            {selectedType && (
              <div className="px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2">
                <span className="text-amber-400 text-sm">✨ Pengajuan ini akan memberikan <strong>{selectedType.points} poin</strong> jika disetujui.</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-slate-400 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                id="submit-submission-btn"
                disabled={submitting}
                className="flex-1 py-2 bg-gradient-to-r from-primary-500 to-indigo-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 glow-btn"
              >
                {submitting ? 'Mengirim...' : resubmitId ? 'Ajukan Ulang' : 'Kirim Pengajuan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-500">Memuat...</div>
      ) : submissions.length === 0 ? (
        <div className="glass-panel rounded-2xl p-16 text-center">
          <p className="text-4xl mb-3">{category === 'sertifikat' ? '📜' : '💼'}</p>
          <p className="text-slate-400">Belum ada {title.toLowerCase()} yang diajukan.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => (
            <div key={s.id} className="glass-panel glass-panel-hover rounded-xl p-5 transition-all duration-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-white text-sm">{s.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 ${statusColors[s.status]}`}>
                      {statusIcon[s.status]}
                      {statusLabels[s.status]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{s.description}</p>
                  {s.rejectReason && (
                    <div className="mt-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                      ❌ <strong>Alasan penolakan:</strong> {s.rejectReason}
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-slate-500">
                      {types.find(t => t.value === s.subType)?.label || s.subType}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(s.createdAt).toLocaleDateString('id-ID')}
                    </span>
                    {s.status === 'approved' && (
                      <span className="text-xs text-amber-400 font-semibold">+{s.pointValue} pts</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={`http://localhost:4000${s.evidenceFileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs px-3 py-1.5 bg-slate-800 text-slate-400 rounded-lg hover:text-white transition-colors"
                  >
                    <FileText size={13} /> Bukti
                  </a>
                  {s.status === 'rejected' && (
                    <button
                      onClick={() => openResubmit(s)}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 bg-primary-500/10 text-primary-400 rounded-lg hover:bg-primary-500/20 transition-colors"
                    >
                      <RefreshCw size={13} /> Ajukan Ulang
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
