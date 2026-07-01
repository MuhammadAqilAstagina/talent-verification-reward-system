import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pt-16 lg:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
