import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useLanguage } from '../App';
import { motion } from 'motion/react';
import { Calendar, Baby, Activity, Globe } from 'lucide-react';

export default function Onboarding() {
  const { user, token, updateUser } = useAuth();
  const { setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [lang, setLang] = useState(user?.language_code || 'en');
  const [mode, setMode] = useState<'Cycle' | 'Pregnancy'>('Cycle');
  const [lmp, setLmp] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [languages, setLanguages] = useState<{ code: string; name: string }[]>([]);

  useEffect(() => {
    fetch('/api/languages')
      .then(res => res.json())
      .then(setLanguages);
  }, []);

  const handleComplete = async () => {
    const res = await fetch('/api/user/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        language_code: lang,
        mode,
        lmp_date: lmp,
        cycle_length_days: cycleLength,
      }),
    });

    if (res.ok) {
      updateUser({ language_code: lang, mode, lmp_date: lmp, cycle_length_days: cycleLength });
      setLanguage(lang);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-bloom-bg flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                s <= step ? 'bg-bloom-pink' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-3xl shadow-xl p-8 border border-blush"
        >
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Globe className="text-bloom-pink" />
                <h2 className="text-2xl font-bold text-gray-800">Select Language</h2>
              </div>
              <p className="text-gray-500">Choose your preferred language for the app.</p>
              <div className="grid grid-cols-1 gap-3">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      lang === l.code
                        ? 'border-bloom-pink bg-bloom-pink/5 text-bloom-pink font-bold'
                        : 'border-gray-100 hover:border-blush'
                    }`}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full bg-bloom-pink text-white font-bold py-4 rounded-xl shadow-lg shadow-bloom-pink/20"
              >
                Next
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="text-bloom-pink" />
                <h2 className="text-2xl font-bold text-gray-800">Select Mode</h2>
              </div>
              <p className="text-gray-500">How would you like to use BloomCare?</p>
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => setMode('Cycle')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                    mode === 'Cycle'
                      ? 'border-bloom-pink bg-bloom-pink/5 text-bloom-pink font-bold'
                      : 'border-gray-100 hover:border-blush'
                  }`}
                >
                  <div className={`p-3 rounded-full ${mode === 'Cycle' ? 'bg-bloom-pink text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <Calendar size={24} />
                  </div>
                  <div>
                    <div className="text-lg">Cycle Tracking</div>
                    <div className="text-sm font-normal opacity-70 text-gray-600">Track periods and ovulation</div>
                  </div>
                </button>
                <button
                  onClick={() => setMode('Pregnancy')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                    mode === 'Pregnancy'
                      ? 'border-bloom-pink bg-bloom-pink/5 text-bloom-pink font-bold'
                      : 'border-gray-100 hover:border-blush'
                  }`}
                >
                  <div className={`p-3 rounded-full ${mode === 'Pregnancy' ? 'bg-bloom-pink text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <Baby size={24} />
                  </div>
                  <div>
                    <div className="text-lg">Pregnancy Mode</div>
                    <div className="text-sm font-normal opacity-70 text-gray-600">Monitor baby's growth weekly</div>
                  </div>
                </button>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-4 text-gray-500 font-bold">{t('back')}</button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-[2] bg-bloom-pink text-white font-bold py-4 rounded-xl shadow-lg shadow-bloom-pink/20"
                >
                  {t('next')}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="text-bloom-pink" />
                <h2 className="text-2xl font-bold text-gray-800">Final Details</h2>
              </div>
              <p className="text-gray-500">
                {mode === 'Cycle' 
                  ? 'When was the first day of your last period?' 
                  : 'What was the first day of your last menstrual period (LMP)?'}
              </p>
              <div>
                <input
                  type="date"
                  value={lmp}
                  onChange={(e) => setLmp(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-bloom-pink outline-none"
                  required
                />
              </div>
              {mode === 'Cycle' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Average Cycle Length (days)</label>
                  <input
                    type="number"
                    value={cycleLength}
                    onChange={(e) => setCycleLength(parseInt(e.target.value))}
                    className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-bloom-pink outline-none"
                    min="20"
                    max="45"
                  />
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-4 text-gray-500 font-bold">{t('back')}</button>
                <button
                  onClick={handleComplete}
                  className="flex-[2] bg-bloom-pink text-white font-bold py-4 rounded-xl shadow-lg shadow-bloom-pink/20"
                >
                  {t('get_started')}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
