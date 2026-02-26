import React, { useState, useEffect } from 'react';
import { useAuth, useLanguage } from '../App';
import { motion } from 'motion/react';
import { LogOut, Globe, Activity, Calendar, Save, ChevronRight } from 'lucide-react';

export default function Settings() {
  const { user, token, logout, updateUser } = useAuth();
  const { t, language: currentLang, setLanguage } = useLanguage();
  
  const [mode, setMode] = useState(user?.mode || 'Cycle');
  const [lang, setLang] = useState(user?.language_code || 'en');
  const [lmp, setLmp] = useState(user?.lmp_date || '');
  const [cycleLen, setCycleLen] = useState(user?.cycle_length_days || 28);
  const [languages, setLanguages] = useState<{ code: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/languages')
      .then(res => res.json())
      .then(setLanguages);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch('/api/user/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        mode,
        language_code: lang,
        lmp_date: lmp,
        cycle_length_days: cycleLen,
      }),
    });

    if (res.ok) {
      updateUser({ mode, language_code: lang, lmp_date: lmp, cycle_length_days: cycleLen });
      setLanguage(lang);
      alert('Settings saved successfully!');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">{t('settings')}</h2>

      <div className="space-y-6">
        {/* Language */}
        <section className="bg-white p-6 rounded-3xl border border-blush shadow-sm space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="text-bloom-pink" size={20} />
            <h3 className="font-bold text-gray-800">Language</h3>
          </div>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-bloom-pink"
          >
            {languages.map(l => (
              <option key={l.code} value={l.code}>{l.name}</option>
            ))}
          </select>
        </section>

        {/* Mode */}
        <section className="bg-white p-6 rounded-3xl border border-blush shadow-sm space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="text-bloom-pink" size={20} />
            <h3 className="font-bold text-gray-800">App Mode</h3>
          </div>
          <div className="flex gap-2">
            {['Cycle', 'Pregnancy'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m as any)}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                  mode === m ? 'bg-bloom-pink text-white shadow-lg shadow-bloom-pink/20' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </section>

        {/* Cycle/Pregnancy Details */}
        <section className="bg-white p-6 rounded-3xl border border-blush shadow-sm space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="text-bloom-pink" size={20} />
            <h3 className="font-bold text-gray-800">Health Data</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Last Period Date (LMP)</label>
              <input
                type="date"
                value={lmp}
                onChange={(e) => setLmp(e.target.value)}
                className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-bloom-pink"
              />
            </div>
            {mode === 'Cycle' && (
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Cycle Length (Days)</label>
                <input
                  type="number"
                  value={cycleLen}
                  onChange={(e) => setCycleLen(parseInt(e.target.value))}
                  className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-bloom-pink"
                />
              </div>
            )}
          </div>
        </section>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-bloom-pink text-white font-bold py-5 rounded-3xl shadow-xl shadow-bloom-pink/30 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
        >
          <Save size={24} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>

        <button
          onClick={logout}
          className="w-full bg-white text-red-500 font-bold py-5 rounded-3xl border border-red-100 flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          <LogOut size={24} />
          Logout
        </button>
      </div>
    </div>
  );
}
