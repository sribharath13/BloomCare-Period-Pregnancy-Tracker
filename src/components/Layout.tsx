import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Calendar, PlusCircle, Settings, Bell } from 'lucide-react';
import { useLanguage } from '../App';
import { motion } from 'motion/react';

export default function Layout() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-bloom-bg pb-24">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center border-b border-blush/30">
        <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
          <span className="w-8 h-8 bg-bloom-pink rounded-full flex items-center justify-center text-white text-xs">B</span>
          BloomCare
        </h1>
        <button className="p-2 text-gray-400 hover:text-bloom-pink transition-colors">
          <Bell size={24} />
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-6">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-blush/30 px-6 py-3 pb-8 z-50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <NavIcon to="/" icon={<Home size={24} />} label={t('home')} />
          <NavIcon to="/calendar" icon={<Calendar size={24} />} label={t('calendar')} />
          <NavLink
            to="/log"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-all ${
                isActive ? 'text-bloom-pink scale-110' : 'text-gray-400 hover:text-bloom-pink'
              }`
            }
          >
            <div className="bg-bloom-pink text-white p-3 rounded-full shadow-lg shadow-bloom-pink/30 -mt-10 border-4 border-bloom-bg">
              <PlusCircle size={28} />
            </div>
          </NavLink>
          <NavIcon to="/reminders" icon={<Bell size={24} />} label={t('reminders')} />
          <NavIcon to="/settings" icon={<Settings size={24} />} label={t('settings')} />
        </div>
      </nav>
    </div>
  );
}

function NavIcon({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 transition-all ${
          isActive ? 'text-bloom-pink' : 'text-gray-400 hover:text-bloom-pink'
        }`
      }
    >
      {icon}
      <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
    </NavLink>
  );
}
