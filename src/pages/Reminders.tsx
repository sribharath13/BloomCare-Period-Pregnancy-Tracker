import React, { useEffect, useState } from 'react';
import { useAuth, useLanguage } from '../App';
import { motion } from 'motion/react';
import { Bell, Plus, Trash2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Reminder } from '../types';
import { format, parseISO } from 'date-fns';

export default function RemindersPage() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    fetchReminders();
  }, [token]);

  const fetchReminders = () => {
    fetch('/api/reminders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setReminders);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/reminders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ title: newTitle, remind_at: newTime }),
    });

    if (res.ok) {
      setNewTitle('');
      setNewTime('');
      setShowAdd(false);
      fetchReminders();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Bell className="text-bloom-pink" />
          <h2 className="text-2xl font-bold text-gray-800">{t('reminders')}</h2>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="p-3 bg-bloom-pink text-white rounded-2xl shadow-lg shadow-bloom-pink/30 active:scale-95 transition-all"
        >
          <Plus size={24} />
        </button>
      </div>

      {showAdd && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl border border-blush shadow-xl space-y-4"
        >
          <h3 className="font-bold text-gray-800">New Reminder</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <input
              type="text"
              placeholder="Reminder Title (e.g. Take Vitamins)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-bloom-pink"
              required
            />
            <input
              type="datetime-local"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-bloom-pink"
              required
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="flex-1 py-3 text-gray-500 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-bloom-pink text-white font-bold py-3 rounded-xl"
              >
                Add
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="space-y-4">
        {reminders.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-3xl border border-dashed border-blush">
            <p className="text-gray-400">No reminders set. Click the + button to add one.</p>
          </div>
        ) : (
          reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="bg-white p-5 rounded-3xl border border-blush shadow-sm flex justify-between items-center"
            >
              <div className="flex gap-4 items-center">
                <div className={`p-3 rounded-2xl ${reminder.is_active ? 'bg-bloom-pink/10 text-bloom-pink' : 'bg-gray-100 text-gray-400'}`}>
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className={`font-bold ${reminder.is_active ? 'text-gray-800' : 'text-gray-400 line-through'}`}>
                    {reminder.title}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {format(parseISO(reminder.remind_at), 'MMM do, h:mm a')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {reminder.is_active ? (
                  <CheckCircle2 className="text-green-400" size={20} />
                ) : (
                  <XCircle className="text-gray-300" size={20} />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
