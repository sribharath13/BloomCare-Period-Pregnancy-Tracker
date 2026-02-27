import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useLanguage } from '../App';
import { motion } from 'motion/react';
import { Check, Crown, Sparkles, Zap, Heart } from 'lucide-react';

export default function Subscription() {
  const { user, updateUser, token } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tier: 'premium' }),
      });
      if (res.ok) {
        updateUser({ subscription_tier: 'premium' });
        navigate('/');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: 'Bloom Free',
      price: '$0',
      features: [
        'Cycle Tracking',
        'Basic Health Logs',
        'Standard Reminders',
        'Community Access'
      ],
      current: user?.subscription_tier === 'free',
      buttonText: 'Current Plan',
      premium: false
    },
    {
      name: 'Bloom Premium',
      price: '$4.99',
      period: '/month',
      features: [
        'AI Health Insights',
        'Advanced Pregnancy Mode',
        'Partner Syncing',
        'Detailed Trend Analytics',
        'Priority Support'
      ],
      current: user?.subscription_tier === 'premium',
      buttonText: 'Upgrade to Premium',
      premium: true
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-bloom-pink/10 text-bloom-pink text-sm font-bold mb-6"
        >
          <Crown size={16} />
          PREMIUM EXPERIENCE
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">
          Elevate your wellness journey
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Unlock advanced AI insights, deeper analytics, and a more personalized care experience.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`relative p-8 rounded-3xl border-2 transition-all ${
              plan.premium 
                ? 'border-bloom-pink bg-white shadow-2xl shadow-bloom-pink/10' 
                : 'border-gray-100 bg-gray-50/50'
            }`}
          >
            {plan.premium && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-bloom-pink text-white text-xs font-black rounded-full uppercase tracking-widest">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-gray-900">{plan.price}</span>
                {plan.period && <span className="text-gray-500 font-medium">{plan.period}</span>}
              </div>
            </div>

            <ul className="space-y-4 mb-10">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-gray-600">
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.premium ? 'bg-bloom-pink/10 text-bloom-pink' : 'bg-gray-200 text-gray-500'}`}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="text-sm font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={plan.premium && !plan.current ? handleUpgrade : undefined}
              disabled={plan.current || loading}
              className={`w-full py-4 rounded-2xl font-bold transition-all ${
                plan.current
                  ? 'bg-gray-100 text-gray-400 cursor-default'
                  : plan.premium
                    ? 'bg-bloom-pink text-white hover:bg-bloom-pink/90 shadow-lg shadow-bloom-pink/20 active:scale-[0.98]'
                    : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {loading ? 'Processing...' : plan.buttonText}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 grid md:grid-cols-3 gap-8 text-center">
        <div className="p-6">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap size={24} />
          </div>
          <h4 className="font-bold text-gray-900 mb-2">Instant Insights</h4>
          <p className="text-sm text-gray-500 leading-relaxed">AI-powered analysis of your symptoms and cycle patterns.</p>
        </div>
        <div className="p-6">
          <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles size={24} />
          </div>
          <h4 className="font-bold text-gray-900 mb-2">Personalized Care</h4>
          <p className="text-sm text-gray-500 leading-relaxed">Tailored recommendations based on your unique health data.</p>
        </div>
        <div className="p-6">
          <div className="w-12 h-12 bg-pink-50 text-bloom-pink rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart size={24} />
          </div>
          <h4 className="font-bold text-gray-900 mb-2">Priority Support</h4>
          <p className="text-sm text-gray-500 leading-relaxed">24/7 access to our team of health and wellness experts.</p>
        </div>
      </div>
    </div>
  );
}
