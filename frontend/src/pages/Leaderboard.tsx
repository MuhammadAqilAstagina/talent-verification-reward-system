import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Crown, Medal } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  name: string;
  nim?: string;
  programStudi?: string;
  totalPoints: number;
  rank: number;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProdi, setFilterProdi] = useState('');
  const [prodiList, setProdiList] = useState<string[]>([]);

  useEffect(() => {
    api.get('/leaderboard')
      .then((res) => {
        const data: LeaderboardEntry[] = res.data.leaderboard;
        setEntries(data);
        const prodis = [...new Set(data.map(d => d.programStudi || '').filter(Boolean))];
        setProdiList(prodis);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filterProdi
    ? entries.filter(e => e.programStudi === filterProdi)
    : entries;

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={18} className="text-amber-400" />;
    if (rank === 2) return <Medal size={16} className="text-slate-300" />;
    if (rank === 3) return <Medal size={16} className="text-amber-600" />;
    return <span className="text-sm text-slate-500 font-mono w-[18px] text-center">#{rank}</span>;
  };

  const rankBg = (rank: number, isMe: boolean) => {
    if (isMe) return 'border-primary-500/50 bg-primary-500/10';
    if (rank === 1) return 'border-amber-500/30 bg-amber-500/5';
    if (rank === 2) return 'border-slate-400/20 bg-slate-400/5';
    if (rank === 3) return 'border-amber-700/20 bg-amber-700/5';
    return 'border-slate-800 bg-transparent';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-[Outfit] flex items-center gap-2">
            <Trophy size={24} className="text-amber-400" />
            Leaderboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">Ranking mahasiswa berdasarkan total poin.</p>
        </div>

        {prodiList.length > 0 && (
          <select
            value={filterProdi}
            onChange={(e) => setFilterProdi(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:border-primary-500"
          >
            <option value="">Semua Program Studi</option>
            {prodiList.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        )}
      </div>

      {/* Top 3 podium */}
      {!loading && filtered.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[filtered[1], filtered[0], filtered[2]].map((entry, idx) => {
            const podiumOrder = [2, 1, 3];
            const rank = podiumOrder[idx];
            const heights = ['h-24', 'h-32', 'h-20'];
            const isMe = entry?.id === user?.id;
            return (
              <div key={entry?.id} className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                  rank === 1 ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                  rank === 2 ? 'bg-gradient-to-br from-slate-400 to-slate-600' :
                  'bg-gradient-to-br from-amber-700 to-amber-900'
                }`}>
                  {entry?.name?.charAt(0)}
                </div>
                <p className="text-xs text-white font-medium text-center leading-tight max-w-[80px] truncate">{entry?.name}</p>
                <p className="text-xs text-amber-400 font-bold">{entry?.totalPoints} pts</p>
                <div className={`w-full glass-panel rounded-t-lg flex items-end justify-center ${heights[idx]} ${isMe ? 'border-primary-500/50' : ''}`}>
                  <span className="text-2xl mb-2">
                    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Memuat leaderboard...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Tidak ada data.</div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filtered.map((entry) => {
              const isMe = entry.id === user?.id;
              return (
                <div
                  key={entry.id}
                  className={`flex items-center gap-4 px-5 py-4 border transition-colors ${rankBg(entry.rank, isMe)} ${isMe ? 'sticky' : ''}`}
                >
                  <div className="flex-shrink-0 w-8 flex justify-center">
                    {rankIcon(entry.rank)}
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {entry.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white truncate">{entry.name}</p>
                      {isMe && (
                        <span className="text-xs px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded-full border border-primary-500/30">Anda</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{entry.nim} · {entry.programStudi}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-amber-400 text-sm">{entry.totalPoints}</p>
                    <p className="text-xs text-slate-500">poin</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
