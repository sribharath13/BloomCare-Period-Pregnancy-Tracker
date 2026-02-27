import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { User, TranslationMap } from './types';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import HealthLogPage from './pages/HealthLog';
import CalendarPage from './pages/Calendar';
import RemindersPage from './pages/Reminders';
import Settings from './pages/Settings';
import Subscription from './pages/Subscription';
import Layout from './components/Layout';

// --- Contexts ---
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

interface LanguageContextType {
  translations: TranslationMap;
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};

// --- Providers ---
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...updates };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [language, setLanguageState] = useState(user?.language_code || 'en');
  const [translations, setTranslations] = useState<TranslationMap>({});

  useEffect(() => {
    const lang = user?.language_code || language;
    fetch(`/api/translations/${lang}`)
      .then(res => res.json())
      .then(setTranslations);
  }, [user?.language_code, language]);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
  };

  const t = (key: string) => translations[key] || key;

  return (
    <LanguageContext.Provider value={{ translations, language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// --- Protected Route ---
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" />;
  if (user && !user.lmp_date && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="log" element={<HealthLogPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="reminders" element={<RemindersPage />} />
              <Route path="settings" element={<Settings />} />
              <Route path="premium" element={<Subscription />} />
            </Route>
          </Routes>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}
