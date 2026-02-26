import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('bloomcare.db');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    mode TEXT DEFAULT 'Cycle',
    language_code TEXT DEFAULT 'en',
    lmp_date TEXT,
    cycle_length_days INTEGER DEFAULT 28,
    due_date TEXT,
    consent_accepted INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS health_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    log_date TEXT NOT NULL,
    type TEXT NOT NULL,
    tags TEXT, -- JSON array
    severity INTEGER,
    value_number REAL,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS pregnancy_weeks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week_number INTEGER NOT NULL,
    language_code TEXT NOT NULL,
    baby_update TEXT,
    body_update TEXT,
    tips TEXT,
    UNIQUE(week_number, language_code)
  );

  CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    remind_at TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS languages (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL,
    language_code TEXT NOT NULL,
    value TEXT NOT NULL,
    UNIQUE(key, language_code)
  );
`);

// Seed initial data if empty
const languages = db.prepare('SELECT COUNT(*) as count FROM languages').get() as { count: number };
if (languages.count === 0) {
  db.prepare('INSERT INTO languages (code, name) VALUES (?, ?)').run('en', 'English');
  db.prepare('INSERT INTO languages (code, name) VALUES (?, ?)').run('es', 'Español');
  
  // Basic translations
  const translations = [
    { key: 'app_name', en: 'BloomCare', es: 'BloomCare' },
    { key: 'welcome', en: 'Welcome to BloomCare', es: 'Bienvenida a BloomCare' },
    { key: 'login', en: 'Login', es: 'Iniciar Sesión' },
    { key: 'signup', en: 'Sign Up', es: 'Registrarse' },
    { key: 'email', en: 'Email', es: 'Correo electrónico' },
    { key: 'password', en: 'Password', es: 'Contraseña' },
    { key: 'gdpr_consent', en: 'I agree to the processing of my health data', es: 'Acepto el procesamiento de mis datos de salud' },
    { key: 'next_period', en: 'Next Period', es: 'Próximo Periodo' },
    { key: 'ovulation', en: 'Ovulation', es: 'Ovulación' },
    { key: 'fertile_window', en: 'Fertile Window', es: 'Ventana Fértil' },
    { key: 'pregnancy_week', en: 'Pregnancy Week', es: 'Semana de Embarazo' },
    { key: 'due_date', en: 'Due Date', es: 'Fecha de Parto' },
    { key: 'log_today', en: 'Log Today', es: 'Registrar Hoy' },
    { key: 'settings', en: 'Settings', es: 'Ajustes' },
    { key: 'calendar', en: 'Calendar', es: 'Calendario' },
    { key: 'reminders', en: 'Reminders', es: 'Recordatorios' },
    { key: 'home', en: 'Home', es: 'Inicio' },
    { key: 'save_log', en: 'Save Log', es: 'Guardar Registro' },
    { key: 'back', en: 'Back', es: 'Atrás' },
    { key: 'next', en: 'Next', es: 'Siguiente' },
    { key: 'get_started', en: 'Get Started', es: 'Empezar' },
  ];

  const insertTranslation = db.prepare('INSERT INTO translations (key, language_code, value) VALUES (?, ?, ?)');
  for (const t of translations) {
    insertTranslation.run(t.key, 'en', t.en);
    insertTranslation.run(t.key, 'es', t.es);
  }

  // Seed some pregnancy weeks
  const insertWeek = db.prepare('INSERT INTO pregnancy_weeks (week_number, language_code, baby_update, body_update, tips) VALUES (?, ?, ?, ?, ?)');
  for (let i = 1; i <= 42; i++) {
    insertWeek.run(i, 'en', `Baby is growing in week ${i}`, `Your body is changing in week ${i}`, `Tip for week ${i}: Stay hydrated.`);
    insertWeek.run(i, 'es', `El bebé está creciendo en la semana ${i}`, `Tu cuerpo está cambiando en la semana ${i}`, `Consejo para la semana ${i}: Mantente hidratada.`);
  }
}

export default db;
