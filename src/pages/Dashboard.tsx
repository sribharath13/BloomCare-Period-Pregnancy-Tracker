import React, { useEffect, useState } from 'react';
import { useAuth, useLanguage } from '../App';
import { motion } from 'motion/react';
import { format, addDays, differenceInDays, parseISO, startOfDay } from 'date-fns';
import { Calendar, Droplets, Baby, Info, ChevronRight, PlusCircle } from 'lucide-react';
import { PregnancyWeek } from '../types';

import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, token } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [weekData, setWeekData] = useState<PregnancyWeek | null>(null);

  useEffect(() => {
    if (user?.mode === 'Pregnancy' && user.lmp_date) {
      const lmp = parseISO(user.lmp_date);
      const today = startOfDay(new Date());
      const daysDiff = differenceInDays(today, lmp);
      const week = Math.floor(daysDiff / 7) + 1;
      const clampedWeek = Math.min(Math.max(week, 1), 42);

      fetch(`/api/pregnancy-weeks/${clampedWeek}?lang=${language}`)
        .then(res => res.json())
        .then(setWeekData);
    }
  }, [user, language]);

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800">Hello, Bloom!</h2>
        <p className="text-gray-500">Today is {format(new Date(), 'EEEE, MMMM do')}</p>
      </section>

      {user.mode === 'Cycle' ? (
        <CycleDashboard user={user} t={t} />
      ) : (
        <PregnancyDashboard user={user} weekData={weekData} t={t} />
      )}

      {/* Quick Tips / Insights */}
      <section className="bg-teal-muted/20 rounded-3xl p-6 border border-teal-muted/30">
        <div className="flex items-center gap-3 mb-3">
          <Info className="text-teal-muted" />
          <h3 className="font-bold text-gray-800">Daily Insight</h3>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          Staying hydrated and getting enough sleep can significantly improve your mood and energy levels today.
        </p>
      </section>

      {/* Quick Action */}
      <button 
        onClick={() => navigate('/log')}
        className="w-full bg-bloom-pink text-white font-bold py-5 rounded-3xl shadow-xl shadow-bloom-pink/30 flex items-center justify-center gap-3 active:scale-95 transition-all"
      >
        <PlusCircle size={24} />
        {t('log_today')}
      </button>
    </div>
  );
}

function CycleDashboard({ user, t }: { user: any; t: any }) {
  const lmp = parseISO(user.lmp_date);
  const cycleLen = user.cycle_length_days || 28;
  const nextPeriod = addDays(lmp, cycleLen);
  const ovulation = addDays(nextPeriod, -14);
  const fertileStart = addDays(ovulation, -5);
  const fertileEnd = addDays(ovulation, 1);
  
  const daysUntil = differenceInDays(nextPeriod, startOfDay(new Date()));

  return (
    <div className="space-y-6">
      {/* Main Circle Display */}
      <div className="flex justify-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-64 h-64 rounded-full border-8 border-blush flex flex-col items-center justify-center bg-white shadow-2xl shadow-blush/50 relative"
        >
          <div className="absolute inset-0 rounded-full border-8 border-bloom-pink border-t-transparent animate-spin-slow opacity-20" />
          <Droplets className="text-bloom-pink mb-2" size={32} />
          <span className="text-4xl font-black text-gray-800">{daysUntil}</span>
          <span className="text-sm font-medium text-gray-500 uppercase tracking-widest">Days to Period</span>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-blush shadow-sm">
          <div className="text-xs font-bold text-gray-400 uppercase mb-1">{t('ovulation')}</div>
          <div className="text-lg font-bold text-gray-800">{format(ovulation, 'MMM do')}</div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-blush shadow-sm">
          <div className="text-xs font-bold text-gray-400 uppercase mb-1">{t('fertile_window')}</div>
          <div className="text-lg font-bold text-gray-800">{format(fertileStart, 'MMM d')} - {format(fertileEnd, 'd')}</div>
        </div>
      </div>
    </div>
  );
}

function PregnancyDashboard({ user, weekData, t }: { user: any; weekData: PregnancyWeek | null; t: any }) {
  const lmp = parseISO(user.lmp_date);
  const today = startOfDay(new Date());
  const daysDiff = differenceInDays(today, lmp);
  const week = Math.floor(daysDiff / 7) + 1;
  const dayInWeek = daysDiff % 7;
  const dueDate = addDays(lmp, 280);

  return (
    <div className="space-y-6">
      {/* Week Progress */}
      <div className="bg-white rounded-3xl p-6 border border-blush shadow-sm text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Baby size={120} />
        </div>
        <div className="relative z-10">
          <h3 className="text-sm font-bold text-bloom-pink uppercase tracking-widest mb-2">Week {week}</h3>
          <div className="text-4xl font-black text-gray-800 mb-1">Week {week}, Day {dayInWeek}</div>
          <p className="text-gray-500">Due Date: {format(dueDate, 'MMMM do, yyyy')}</p>
        </div>
      </div>

      {/* Week Updates */}
      {weekData && (
        <div className="space-y-4">
          <UpdateCard 
            title="Baby's Growth" 
            content={weekData.baby_update} 
            color="bg-peach/30" 
            icon={<Baby className="text-orange-400" />} 
          />
          <UpdateCard 
            title="Your Body" 
            content={weekData.body_update} 
            color="bg-blush/30" 
            icon={<Activity className="text-bloom-pink" />} 
          />
          <UpdateCard 
            title="Weekly Tip" 
            content={weekData.tips} 
            color="bg-teal-muted/30" 
            icon={<Info className="text-teal-muted" />} 
          />
        </div>
      )}
    </div>
  );
}

function UpdateCard({ title, content, color, icon }: { title: string; content: string; color: string; icon: React.ReactNode }) {
  return (
    <motion.div 
      whileHover={{ x: 5 }}
      className={`p-6 rounded-3xl ${color} border border-white/50 flex gap-4 items-start`}
    >
      <div className="p-3 bg-white rounded-2xl shadow-sm">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-gray-800 mb-1">{title}</h4>
        <p className="text-sm text-gray-600 leading-relaxed">{content}</p>
      </div>
    </motion.div>
  );
}

function Activity({ className, size }: { className?: string; size?: number }) {
  return <Info className={className} size={size} />;
}
