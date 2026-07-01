import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Gift, Plus, X, Upload, Loader2, Star, ToggleLeft, ToggleRight } from 'lucide-react';

interface Reward {
  id: string; title: string; description: string;
  imageUrl?: string; pointRequired: number; stock: number; isActive: boolean;
}

export default function AdminRewards() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', pointRequired: '', stock: '' });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function fetchRewards() {
    setLoading(true);
    try {
      const res = await api.get('/rewards');
      setRewards(res.data.rewards);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchRewards(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('pointRequired', form.pointRequired);
    fd.append('stock', form.stock);
    if (file) fd.append('image', file);

    setSubmitting(true);
    try {
      await api.post('/rewards', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowForm(false);
      setForm({ title: '', description: '', pointRequired: '', stock: '' });
      setFile(null);
      fetchRewards();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal membuat reward.');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(id: string, current: boolean) {
    try {
      await api.put(`/rewards/${id}`, { isActive: String(!current) });
      fetchRewards();
    } catch (e) { console.error(e); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-[Outfit] flex items-center gap-2">
            <Gift size={22} className="text-primary-400" />
            Kelola Reward
          </h1>
          <p className="text-slate-400 text-sm mt-1">Buat dan kelola katalog reward untuk mahasiswa.</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setError(''); }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 glow-btn"
        >
          <Plus size={16} /> Tambah Reward
        </button>
      </div>

      {showForm && (
        <div className="glass-panel rounded-2xl p-6 border border-primary-500/20">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-white font-[Outfit]">Tambah Reward Baru</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white"><X size={18} /></button>
          </div>
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
          )}
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Judul Reward</label>
              <input
                required
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
                placeholder="Nama reward"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Deskripsi</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 resize-none"
                placeholder="Deskripsi singkat reward"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Poin Dibutuhkan</label>
              <input
                required type="number" min="1"
                value={form.pointRequired}
                onChange={e => setForm({ ...form, pointRequired: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
                placeholder="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Stok</label>
              <input
                required type="number" min="0"
                value={form.stock}
                onChange={e => setForm({ ...form, stock: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
                placeholder="50"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Gambar (opsional)</label>
              <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-primary-500 transition-colors">
                <Upload size={18} className="text-slate-500" />
                <span className="text-sm text-slate-400">{file ? file.name : 'Upload gambar reward (JPG, PNG)'}</span>
                <input type="file" accept=".jpg,.jpeg,.png" onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" />
              </label>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-400 border border-slate-700 rounded-xl hover:bg-slate-800">Batal</button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 bg-gradient-to-r from-primary-500 to-indigo-600 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? 'Menyimpan...' : 'Buat Reward'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-500">Memuat...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map(r => (
            <div key={r.id} className={`glass-panel rounded-2xl overflow-hidden ${!r.isActive ? 'opacity-50' : ''}`}>
              {r.imageUrl ? (
                <img src={`http://localhost:4000${r.imageUrl}`} alt={r.title} className="w-full h-36 object-cover" />
              ) : (
                <div className="w-full h-36 bg-gradient-to-br from-primary-500/10 to-indigo-500/10 flex items-center justify-center text-4xl">🎁</div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-white text-sm">{r.title}</h3>
                <p className="text-xs text-slate-400 mt-1 mb-3 line-clamp-2">{r.description}</p>
                <div className="flex items-center justify-between text-xs mb-3">
                  <div className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Star size={12} /> {r.pointRequired} pts
                  </div>
                  <span className="text-slate-500">Stok: {r.stock}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${r.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                    {r.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                  <button
                    onClick={() => toggleActive(r.id, r.isActive)}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    {r.isActive ? <ToggleRight size={18} className="text-emerald-400" /> : <ToggleLeft size={18} />}
                    {r.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
