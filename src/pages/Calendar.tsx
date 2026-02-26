import React, { useEffect, useState } from 'react';
import { useAuth, useLanguage } from '../App';
import { motion } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { HealthLog } from '../types';
import { Thermometer, Weight, MessageSquare, Smile, Activity, Calendar as CalendarIcon } from 'lucide-react';

const ICON_MAP: any = {
  Symptom: <Activity size={18} />,
  Mood: <Smile size={18} />,
  Note: <MessageSquare size={18} />,
  Weight: <Weight size={18} />,
  Temp: <Thermometer size={18} />,
};

const COLOR_MAP: any = {
  Symptom: 'bg-red-50 text-red-500',
  Mood: 'bg-yellow-50 text-yellow-500',
  Note: 'bg-blue-50 text-blue-500',
  Weight: 'bg-green-50 text-green-500',
  Temp: 'bg-purple-50 text-purple-500',
};

export default function CalendarPage() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/logs', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setLogs(data);
        setLoading(false);
      });
  }, [token]);

  // Group logs by date
  const groupedLogs = logs.reduce((acc: any, log) => {
    const date = log.log_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedLogs).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <CalendarIcon className="text-bloom-pink" />
        <h2 className="text-2xl font-bold text-gray-800">{t('calendar')}</h2>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-bloom-pink border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sortedDates.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-3xl border border-dashed border-blush">
          <p className="text-gray-400">No logs found yet. Start by logging your first entry!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedDates.map(date => (
            <div key={date} className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">
                {format(parseISO(date), 'EEEE, MMMM do')}
              </h3>
              <div className="space-y-3">
                {groupedLogs[date].map((log: HealthLog) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-5 rounded-3xl border border-blush shadow-sm flex gap-4 items-start"
                  >
                    <div className={`p-3 rounded-2xl ${COLOR_MAP[log.type]}`}>
                      {ICON_MAP[log.type]}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-gray-800">{log.type}</h4>
                        {log.severity && (
                          <span className="text-xs font-bold text-bloom-pink bg-blush/30 px-2 py-1 rounded-lg">
                            Level {log.severity}
                          </span>
                        )}
                      </div>
                      
                      {/* Tags */}
                      {log.tags && JSON.parse(log.tags as any).length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {JSON.parse(log.tags as any).map((tag: string) => (
                            <span key={tag} className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Value */}
                      {log.value_number && (
                        <div className="text-lg font-black text-gray-800 mb-1">
                          {log.value_number} {log.type === 'Weight' ? 'kg' : '°C'}
                        </div>
                      )}

                      {/* Note */}
                      {log.note && (
                        <p className="text-sm text-gray-500 italic leading-relaxed">
                          "{log.note}"
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
