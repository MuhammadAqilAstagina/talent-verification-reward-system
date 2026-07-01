import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Gift, Star, History, Loader2, CheckCircle } from 'lucide-react';

interface Reward {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  pointRequired: number;
  stock: number;
  isActive: boolean;
}

interface Claim {
  id: string;
  claimedAt: string;
  reward: { id: string; title: string; description: string; imageUrl?: string; pointRequired: number };
}

export default function Rewards() {
  const { user, refreshUser } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [tab, setTab] = useState<'catalog' | 'history'>('catalog');
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([api.get('/rewards'), api.get('/rewards/history')])
      .then(([rRes, hRes]) => {
        setRewards(rRes.data.rewards);
        setClaims(hRes.data.claims);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleClaim(rewardId: string) {
    setClaiming(rewardId);
    setErrorMsg('');
    try {
      const res = await api.post(`/rewards/${rewardId}/claim`);
      setSuccessMsg(res.data.message);
      await refreshUser();
      // Refresh rewards and history
      const [rRes, hRes] = await Promise.all([api.get('/rewards'), api.get('/rewards/history')]);
      setRewards(rRes.data.rewards);
      setClaims(hRes.data.claims);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal mengklaim reward.');
    } finally {
      setClaiming(null);
    }
  }

  const canClaim = (reward: Reward) => (user?.totalPoints ?? 0) >= reward.pointRequired && reward.stock > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white font-[Outfit] flex items-center gap-2">
          <Gift size={24} className="text-primary-400" />
          Reward
        </h1>
        <p className="text-slate-400 text-sm mt-1">Tukarkan poinmu dengan hadiah menarik.</p>
      </div>

      {/* Points info */}
      <div className="glass-panel rounded-2xl p-5 border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-amber-500/5 flex items-center gap-4">
        <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
          <Star size={22} className="text-amber-400" />
        </div>
        <div>
          <p className="text-xs text-slate-400">Poin Tersedia</p>
          <p className="text-3xl font-extrabold text-amber-400 font-[Outfit]">{user?.totalPoints ?? 0}</p>
        </div>
      </div>

      {successMsg && (
        <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-800 rounded-xl w-fit">
        {(['catalog', 'history'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === t ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t === 'catalog' ? '🎁 Katalog' : '📋 Riwayat'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-500">Memuat...</div>
      ) : tab === 'catalog' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map(reward => (
            <div key={reward.id} className="glass-panel glass-panel-hover rounded-2xl overflow-hidden transition-all duration-200">
              {reward.imageUrl ? (
                <img
                  src={`http://localhost:4000${reward.imageUrl}`}
                  alt={reward.title}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-primary-500/10 to-indigo-500/10 flex items-center justify-center text-5xl">
                  🎁
                </div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-white text-sm mb-1">{reward.title}</h3>
                <p className="text-xs text-slate-400 mb-3 line-clamp-2">{reward.description}</p>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-amber-400" />
                    <span className="text-amber-400 font-bold text-sm">{reward.pointRequired} pts</span>
                  </div>
                  <span className="text-xs text-slate-500">Stok: {reward.stock}</span>
                </div>

                <button
                  id={`claim-${reward.id}`}
                  onClick={() => handleClaim(reward.id)}
                  disabled={!canClaim(reward) || claiming === reward.id}
                  className={`w-full py-2 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
                    canClaim(reward)
                      ? 'bg-gradient-to-r from-primary-500 to-indigo-600 text-white hover:opacity-90 glow-btn'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {claiming === reward.id && <Loader2 size={14} className="animate-spin" />}
                  {claiming === reward.id
                    ? 'Memproses...'
                    : !canClaim(reward) && reward.stock === 0
                    ? 'Stok Habis'
                    : !canClaim(reward)
                    ? `Butuh ${reward.pointRequired - (user?.totalPoints ?? 0)} pts lagi`
                    : 'Klaim Sekarang'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {claims.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center text-slate-500">
              <History size={32} className="mx-auto mb-3 opacity-50" />
              Belum ada riwayat klaim.
            </div>
          ) : claims.map(claim => (
            <div key={claim.id} className="glass-panel rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🎁</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{claim.reward.title}</p>
                <p className="text-xs text-slate-500">{new Date(claim.claimedAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-red-400 font-semibold">-{claim.reward.pointRequired} pts</p>
                <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">Selesai</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
