import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './src/db.ts';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'bloomcare-secret-key-123';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Auth Middleware ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // --- API Routes ---

  // Auth
  app.post('/api/auth/signup', async (req, res) => {
    const { email, password, consentAccepted } = req.body;
    if (!consentAccepted) return res.status(400).json({ error: 'Consent required' });

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = db.prepare('INSERT INTO users (email, password, consent_accepted) VALUES (?, ?, ?)').run(email, hashedPassword, 1);
      
      // Fetch the full user object to get defaults
      const user: any = db.prepare('SELECT id, email, mode, language_code FROM users WHERE id = ?').get(result.lastInsertRowid);
      
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
      console.log('User signed up successfully:', email);
      res.json({ token, user });
    } catch (e: any) {
      console.error('Signup error:', e);
      if (e.message.includes('UNIQUE')) {
        res.status(400).json({ error: 'Email already exists' });
      } else {
        res.status(500).json({ error: 'Internal server error: ' + e.message });
      }
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);
    try {
      const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

      if (!user || !(await bcrypt.compare(password, user.password))) {
        console.log('Invalid credentials for:', email);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
      console.log('User logged in successfully:', email);
      res.json({ token, user: { id: user.id, email: user.email, mode: user.mode, language_code: user.language_code } });
    } catch (e: any) {
      console.error('Login error:', e);
      res.status(500).json({ error: 'Internal server error: ' + e.message });
    }
  });

  // User Profile
  app.get('/api/user/me', authenticateToken, (req: any, res) => {
    const user = db.prepare('SELECT id, email, mode, language_code, lmp_date, cycle_length_days, due_date FROM users WHERE id = ?').get(req.user.id);
    res.json(user);
  });

  app.patch('/api/user/me', authenticateToken, (req: any, res) => {
    const { mode, language_code, lmp_date, cycle_length_days, due_date } = req.body;
    db.prepare(`
      UPDATE users 
      SET mode = COALESCE(?, mode),
          language_code = COALESCE(?, language_code),
          lmp_date = COALESCE(?, lmp_date),
          cycle_length_days = COALESCE(?, cycle_length_days),
          due_date = COALESCE(?, due_date)
      WHERE id = ?
    `).run(mode, language_code, lmp_date, cycle_length_days, due_date, req.user.id);
    res.json({ success: true });
  });

  // Health Logs
  app.get('/api/logs', authenticateToken, (req: any, res) => {
    const logs = db.prepare('SELECT * FROM health_logs WHERE user_id = ? ORDER BY log_date DESC').all(req.user.id);
    res.json(logs);
  });

  app.post('/api/logs', authenticateToken, (req: any, res) => {
    const { log_date, type, tags, severity, value_number, note } = req.body;
    db.prepare(`
      INSERT INTO health_logs (user_id, log_date, type, tags, severity, value_number, note)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, log_date, type, JSON.stringify(tags || []), severity, value_number, note);
    res.json({ success: true });
  });

  // Reminders
  app.get('/api/reminders', authenticateToken, (req: any, res) => {
    const reminders = db.prepare('SELECT * FROM reminders WHERE user_id = ?').all(req.user.id);
    res.json(reminders);
  });

  app.post('/api/reminders', authenticateToken, (req: any, res) => {
    const { title, remind_at } = req.body;
    db.prepare('INSERT INTO reminders (user_id, title, remind_at) VALUES (?, ?, ?)').run(req.user.id, title, remind_at);
    res.json({ success: true });
  });

  // Pregnancy Weeks
  app.get('/api/pregnancy-weeks/:week', (req, res) => {
    const { week } = req.params;
    const lang = req.query.lang || 'en';
    const data = db.prepare('SELECT * FROM pregnancy_weeks WHERE week_number = ? AND language_code = ?').get(week, lang);
    res.json(data);
  });

  // Translations
  app.get('/api/translations/:lang', (req, res) => {
    const { lang } = req.params;
    const translations = db.prepare('SELECT key, value FROM translations WHERE language_code = ?').all(lang);
    const map = translations.reduce((acc: any, t: any) => {
      acc[t.key] = t.value;
      return acc;
    }, {});
    res.json(map);
  });

  app.get('/api/languages', (req, res) => {
    const languages = db.prepare('SELECT * FROM languages').all();
    res.json(languages);
  });

  app.get('/api/health', (req, res) => {
    try {
      const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
      res.json({ status: 'ok', database: 'connected', users: userCount.count });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  });

  // --- Vite Middleware ---
  const distPath = path.resolve(__dirname, 'dist');
  if (process.env.NODE_ENV !== 'production') {
    console.log('Running in development mode with Vite middleware');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Running in production mode, serving from:', distPath);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BloomCare Server started successfully!`);
    console.log(`Listening on http://0.0.0.0:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch(err => {
  console.error('CRITICAL: Failed to start server:', err);
  process.exit(1);
});
