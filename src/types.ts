export type UserMode = 'Cycle' | 'Pregnancy';

export interface User {
  id: number;
  email: string;
  mode: UserMode;
  language_code: string;
  lmp_date?: string;
  cycle_length_days?: number;
  due_date?: string;
}

export interface HealthLog {
  id: number;
  user_id: number;
  log_date: string;
  type: 'Symptom' | 'Mood' | 'Note' | 'Weight' | 'Temp';
  tags: string[];
  severity?: number;
  value_number?: number;
  note?: string;
}

export interface PregnancyWeek {
  week_number: number;
  language_code: string;
  baby_update: string;
  body_update: string;
  tips: string;
}

export interface Reminder {
  id: number;
  title: string;
  remind_at: string;
  is_active: boolean;
}

export interface TranslationMap {
  [key: string]: string;
}
