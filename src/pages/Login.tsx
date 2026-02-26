import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, useLanguage } from '../App';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      login(data.token, data.user);
      navigate('/');
    } else {
      setError(data.error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-blush"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blush rounded-full flex items-center justify-center mb-4">
            <Heart className="text-bloom-pink fill-bloom-pink" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">BloomCare</h1>
          <p className="text-gray-500 mt-2">{t('welcome')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-bloom-pink focus:border-transparent outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-bloom-pink focus:border-transparent outline-none transition-all"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-bloom-pink hover:bg-bloom-pink/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-bloom-pink/20 transition-all active:scale-[0.98]"
          >
            {t('login')}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-500 text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-bloom-pink font-bold hover:underline">
            {t('signup')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
