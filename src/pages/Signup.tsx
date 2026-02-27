import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, useLanguage } from '../App';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);
  const [isServerUp, setIsServerUp] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) setIsServerUp(true);
      } catch (e) {
        setIsServerUp(false);
      } finally {
        setIsCheckingConnection(false);
      }
    };
    checkConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setError('You must accept the privacy consent');
      return;
    }
    setError('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, consentAccepted: true }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        navigate('/onboarding');
      } else {
        setError(data.error || 'Signup failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Signup fetch error:', err);
      setError('Network error. Please check your connection.');
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
          <p className="text-gray-500 mt-2">Create your account</p>

          <div className="mt-4 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isCheckingConnection ? 'bg-gray-400 animate-pulse' : isServerUp ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              {isCheckingConnection ? 'Checking Server...' : isServerUp ? 'Server Online' : 'Server Offline'}
            </span>
          </div>
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
          
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-bloom-pink focus:ring-bloom-pink"
            />
            <label htmlFor="consent" className="text-sm text-gray-600 leading-tight">
              {t('gdpr_consent')}
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-bloom-pink hover:bg-bloom-pink/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-bloom-pink/20 transition-all active:scale-[0.98]"
          >
            {t('signup')}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-500 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-bloom-pink font-bold hover:underline">
            {t('login')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
