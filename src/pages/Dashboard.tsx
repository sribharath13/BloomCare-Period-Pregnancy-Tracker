import React, { useEffect, useState } from 'react';
import { useAuth, useLanguage } from '../App';
import { motion } from 'motion/react';
import { format, addDays, differenceInDays, parseISO, startOfDay } from 'date-fns';
import { Calendar, Droplets, Baby, Info, ChevronRight, PlusCircle, Crown, Sparkles, TrendingUp } from 'lucide-react';
import { PregnancyWeek } from '../types';
import { GoogleGenAI } from "@google/genai";

import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, token } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [weekData, setWeekData] = useState<PregnancyWeek | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    if (user?.subscription_tier === 'premium') {
      setLoadingInsight(true);
      fetch('/api/ai/insights', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setAiInsight(data.insight))
        .finally(() => setLoadingInsight(false));
    }
  }, [user?.subscription_tier, token]);

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
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <section className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Hello, Bloom!</h2>
          <p className="text-gray-500 font-medium">Today is {format(new Date(), 'EEEE, MMMM do')}</p>
        </div>
        {user.subscription_tier === 'premium' ? (
          <div className="flex items-center gap-2 px-3 py-1 bg-bloom-pink/10 text-bloom-pink rounded-full text-xs font-black uppercase tracking-widest">
            <Crown size={14} />
            Premium
          </div>
        ) : (
          <button 
            onClick={() => navigate('/premium')}
            className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-black uppercase tracking-widest hover:bg-bloom-pink hover:text-white transition-all"
          >
            Upgrade
          </button>
        )}
      </section>

      {user.mode === 'Cycle' ? (
        <CycleDashboard user={user} t={t} />
      ) : (
        <PregnancyDashboard user={user} weekData={weekData} t={t} />
      )}

      {/* Premium AI Insight */}
      {user.subscription_tier === 'premium' && (
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] p-8 text-white shadow-2xl shadow-indigo-500/20"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Sparkles size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={20} className="text-indigo-200" />
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-100">AI Health Insight</h3>
            </div>
            {loadingInsight ? (
              <div className="h-20 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            ) : (
              <p className="text-lg font-medium leading-relaxed text-indigo-50">
                {aiInsight || "Analyzing your data for personalized insights..."}
              </p>
            )}
          </div>
        </motion.section>
      )}

      {/* Free Tier Insight */}
      {user.subscription_tier === 'free' && (
        <section className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-teal-50 text-teal-500 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <h3 className="font-bold text-gray-900">Daily Tip</h3>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Staying hydrated and getting enough sleep can significantly improve your mood and energy levels today. 
            <button onClick={() => navigate('/premium')} className="text-bloom-pink font-bold ml-1 hover:underline">Get premium insights →</button>
          </p>
        </section>
      )}

      {/* Quick Action */}
      <button 
        onClick={() => navigate('/log')}
        className="w-full bg-bloom-pink text-white font-bold py-6 rounded-[2rem] shadow-2xl shadow-bloom-pink/30 flex items-center justify-center gap-3 active:scale-95 transition-all group"
      >
        <PlusCircle size={24} className="group-hover:rotate-90 transition-transform" />
        <span className="text-lg tracking-tight">{t('log_today')}</span>
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
          className="w-64 h-64 rounded-full border-[12px] border-blush flex flex-col items-center justify-center bg-white shadow-2xl shadow-blush/50 relative"
        >
          <div className="absolute inset-0 rounded-full border-[12px] border-bloom-pink border-t-transparent animate-spin-slow opacity-20" />
          <div className="absolute -top-2 -right-2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border border-blush">
            <Droplets className="text-bloom-pink" size={20} />
          </div>
          <span className="text-6xl font-black text-gray-900 tracking-tighter">{daysUntil}</span>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">Days to Period</span>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm group hover:border-bloom-pink/30 transition-colors">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-bloom-pink" />
            {t('ovulation')}
          </div>
          <div className="text-xl font-bold text-gray-900">{format(ovulation, 'MMM do')}</div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm group hover:border-bloom-pink/30 transition-colors">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            {t('fertile_window')}
          </div>
          <div className="text-xl font-bold text-gray-900">{format(fertileStart, 'MMM d')} - {format(fertileEnd, 'd')}</div>
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
