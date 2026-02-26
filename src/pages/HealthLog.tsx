import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useLanguage } from '../App';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { Thermometer, Weight, MessageSquare, Smile, Activity, Save, X } from 'lucide-react';

const LOG_TYPES = [
  { id: 'Symptom', icon: <Activity />, label: 'Symptom', color: 'bg-red-100 text-red-600' },
  { id: 'Mood', icon: <Smile />, label: 'Mood', color: 'bg-yellow-100 text-yellow-600' },
  { id: 'Note', icon: <MessageSquare />, label: 'Note', color: 'bg-blue-100 text-blue-600' },
  { id: 'Weight', icon: <Weight />, label: 'Weight', color: 'bg-green-100 text-green-600' },
  { id: 'Temp', icon: <Thermometer />, label: 'Temp', color: 'bg-purple-100 text-purple-600' },
];

const SYMPTOMS = ['Cramps', 'Headache', 'Bloating', 'Nausea', 'Fatigue', 'Acne', 'Backache'];
const MOODS = ['Happy', 'Sad', 'Anxious', 'Irritable', 'Calm', 'Energetic', 'Tired'];

export default function HealthLogPage() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [type, setType] = useState<any>('Symptom');
  const [logDate, setLogDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [severity, setSeverity] = useState(3);
  const [valueNumber, setValueNumber] = useState('');
  const [note, setNote] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        log_date: logDate,
        type,
        tags: selectedTags,
        severity: type === 'Symptom' || type === 'Mood' ? severity : null,
        value_number: valueNumber ? parseFloat(valueNumber) : null,
        note,
      }),
    });

    if (res.ok) {
      navigate('/');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{t('log_today')}</h2>
        <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Date Picker */}
        <div className="bg-white p-6 rounded-3xl border border-blush shadow-sm">
          <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Log Date</label>
          <input
            type="date"
            value={logDate}
            onChange={(e) => setLogDate(e.target.value)}
            className="w-full text-lg font-bold text-gray-800 outline-none"
          />
        </div>

        {/* Type Selector */}
        <div className="grid grid-cols-5 gap-2">
          {LOG_TYPES.map((lt) => (
            <button
              key={lt.id}
              type="button"
              onClick={() => {
                setType(lt.id);
                setSelectedTags([]);
              }}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                type === lt.id ? 'bg-bloom-pink text-white shadow-lg shadow-bloom-pink/30' : 'bg-white text-gray-400 border border-gray-100'
              }`}
            >
              {lt.icon}
              <span className="text-[10px] font-bold uppercase">{lt.label}</span>
            </button>
          ))}
        </div>

        {/* Tags (Symptoms/Moods) */}
        {(type === 'Symptom' || type === 'Mood') && (
          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest">
              Select {type}s
            </label>
            <div className="flex flex-wrap gap-2">
              {(type === 'Symptom' ? SYMPTOMS : MOODS).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-bloom-pink text-white'
                      : 'bg-white text-gray-600 border border-gray-100'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Severity Slider */}
        {(type === 'Symptom' || type === 'Mood') && (
          <div className="bg-white p-6 rounded-3xl border border-blush shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Severity</label>
              <span className="text-xl font-black text-bloom-pink">{severity}/5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={severity}
              onChange={(e) => setSeverity(parseInt(e.target.value))}
              className="w-full accent-bloom-pink"
            />
          </div>
        )}

        {/* Numeric Value (Weight/Temp) */}
        {(type === 'Weight' || type === 'Temp') && (
          <div className="bg-white p-6 rounded-3xl border border-blush shadow-sm">
            <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
              {type} Value ({type === 'Weight' ? 'kg' : '°C'})
            </label>
            <input
              type="number"
              step="0.1"
              value={valueNumber}
              onChange={(e) => setValueNumber(e.target.value)}
              placeholder={`Enter ${type.toLowerCase()}...`}
              className="w-full text-2xl font-bold text-gray-800 outline-none"
            />
          </div>
        )}

        {/* Note */}
        <div className="bg-white p-6 rounded-3xl border border-blush shadow-sm">
          <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Notes</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="How are you feeling today?"
            className="w-full text-gray-800 outline-none resize-none h-32"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-bloom-pink text-white font-bold py-5 rounded-3xl shadow-xl shadow-bloom-pink/30 flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          <Save size={24} />
          {t('save_log')}
        </button>
      </form>
    </div>
  );
}
