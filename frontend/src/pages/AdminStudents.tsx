import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Users, Search, Star, ChevronRight } from 'lucide-react';

interface Student {
  id: string; name: string; email: string;
  nim?: string; programStudi?: string;
  totalPoints: number; createdAt: string;
  _count: { submissions: number };
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [minPoints, setMinPoints] = useState('');
  const [maxPoints, setMaxPoints] = useState('');

  async function fetchStudents() {
    setLoading(true);
    const params: any = {};
    if (search) params.search = search;
    if (minPoints) params.minPoints = minPoints;
    if (maxPoints) params.maxPoints = maxPoints;
    try {
      const res = await api.get('/admin/students', { params });
      setStudents(res.data.students);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchStudents(); }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchStudents();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white font-[Outfit] flex items-center gap-2">
          <Users size={22} className="text-primary-400" />
          Data Mahasiswa
        </h1>
        <p className="text-slate-400 text-sm mt-1">Lihat dan filter daftar mahasiswa terdaftar.</p>
      </div>

      {/* Search & Filter */}
      <form onSubmit={handleSearch} className="glass-panel rounded-xl p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, email, NIM..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-primary-500"
          />
        </div>
        <input
          type="number"
          value={minPoints}
          onChange={(e) => setMinPoints(e.target.value)}
          placeholder="Min poin"
          className="w-28 px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary-500"
        />
        <input
          type="number"
          value={maxPoints}
          onChange={(e) => setMaxPoints(e.target.value)}
          placeholder="Max poin"
          className="w-28 px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-primary-500"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-xl hover:bg-primary-600 transition-colors"
        >
          Filter
        </button>
      </form>

      {/* Students table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400">Mahasiswa</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400">NIM</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400">Program Studi</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-slate-400">Pengajuan</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-slate-400">Total Poin</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-500">Memuat...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-500">Tidak ada mahasiswa ditemukan.</td></tr>
              ) : students.map(s => (
                <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-400">{s.nim || '—'}</td>
                  <td className="px-5 py-4 text-sm text-slate-400">{s.programStudi || '—'}</td>
                  <td className="px-5 py-4 text-center text-sm text-slate-400">{s._count.submissions}</td>
                  <td className="px-5 py-4 text-center">
                    <span className="flex items-center justify-center gap-1 text-amber-400 font-bold text-sm">
                      <Star size={12} /> {s.totalPoints}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      to={`/admin/students/${s.id}`}
                      className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300"
                    >
                      Detail <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
