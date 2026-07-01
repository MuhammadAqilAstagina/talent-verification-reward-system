import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Trophy, Gift, LogOut,
  CheckSquare, Users, Star, Menu, X, ShieldCheck
} from 'lucide-react';
import { useState } from 'react';

const studentNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/skills', label: 'Sertifikat', icon: Star },
  { to: '/portfolios', label: 'Portofolio', icon: CheckSquare },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/rewards', label: 'Reward', icon: Gift },
];

const adminNav = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/verifications', label: 'Verifikasi', icon: CheckSquare },
  { to: '/admin/students', label: 'Mahasiswa', icon: Users },
  { to: '/admin/rewards', label: 'Kelola Reward', icon: Gift },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = user?.role === 'admin' ? adminNav : studentNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-lg">
            🏆
          </div>
          <div>
            <p className="font-bold text-sm text-white font-[Outfit]">TalentVerify</p>
            <p className="text-xs text-slate-500">
              {user?.role === 'admin' ? 'Admin Panel' : 'Student Portal'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to || location.pathname.startsWith(to + '/');
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User card */}
      <div className="p-4 border-t border-slate-800">
        <div className="glass-panel rounded-xl p-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          {user?.role === 'mahasiswa' && (
            <div className="mt-2 pt-2 border-t border-slate-700 flex items-center gap-2">
              <Star size={12} className="text-amber-400" />
              <span className="text-xs text-amber-400 font-semibold">{user.totalPoints} Poin</span>
            </div>
          )}
          {user?.role === 'admin' && (
            <div className="mt-2 pt-2 border-t border-slate-700 flex items-center gap-2">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span className="text-xs text-emerald-400 font-semibold">Administrator</span>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all duration-200"
        >
          <LogOut size={16} />
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 glass-panel rounded-xl text-slate-300"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 z-40 transform transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
