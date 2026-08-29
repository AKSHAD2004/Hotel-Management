import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UtensilsCrossed, ChefHat, ShieldCheck, UserCheck, KeyRound, Globe, ArrowRight } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  
  const [selectedRole, setSelectedRole] = useState('waiter');
  const [username, setUsername] = useState('waiter');
  const [password, setPassword] = useState('123456');

  // Automatically resolve staff name based on username or role
  const getAutoResolvedName = (uname, role) => {
    const clean = uname.trim().toLowerCase();
    if (clean === 'waiter' || clean === 'w1') {
      return localStorage.getItem('hotel_user_name_waiter') || 'Rahul Sharma';
    }
    if (clean === 'chef' || clean === 'c1') {
      return localStorage.getItem('hotel_user_name_chef') || 'Chef Sanjeev';
    }
    if (clean === 'owner' || clean === 'o1') {
      return localStorage.getItem('hotel_user_name_owner') || 'Vikramaditya Roy';
    }

    const savedName = localStorage.getItem(`hotel_user_name_${role}`);
    if (savedName) return savedName;

    const defaultNames = {
      waiter: 'Rahul Sharma',
      chef: 'Chef Sanjeev',
      owner: 'Vikramaditya Roy'
    };
    return defaultNames[role] || 'Staff Member';
  };

  const currentResolvedName = getAutoResolvedName(username, selectedRole);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setUsername(role);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login(selectedRole, currentResolvedName);
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden bg-slate-900"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.35), rgba(15, 23, 42, 0.6)), url("/hotel-bg.jpg")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Top Header Glass Bar */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full bg-white/10 backdrop-blur-md border border-white/20 p-3.5 sm:px-6 rounded-2xl shadow-xl z-10">
        <div className="flex items-center gap-3">
          <div className="bg-sky-600 text-white p-2 rounded-xl shadow-md shadow-sky-600/30">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-none tracking-wide">{t('appTitle')}</h1>
            <p className="text-xs text-sky-200 font-medium mt-0.5">Hotel Divya • Real-Time Order System</p>
          </div>
        </div>

        {/* Language selector in login */}
        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl p-1 shadow-sm text-xs">
          <Globe className="w-4 h-4 text-sky-200 ml-2" />
          <button
            onClick={() => changeLanguage('en')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${language === 'en' ? 'bg-sky-600 text-white shadow-sm' : 'text-white/80 hover:text-white'}`}
          >
            EN
          </button>
          <button
            onClick={() => changeLanguage('mr')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${language === 'mr' ? 'bg-sky-600 text-white shadow-sm' : 'text-white/80 hover:text-white'}`}
          >
            मराठी
          </button>
          <button
            onClick={() => changeLanguage('hi')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${language === 'hi' ? 'bg-sky-600 text-white shadow-sm' : 'text-white/80 hover:text-white'}`}
          >
            हिंदी
          </button>
        </div>
      </div>

      {/* Main Glassmorphism Login Card Container */}
      <div className="max-w-md w-full mx-auto my-8 z-10">
        <div className="bg-white/25 backdrop-blur-2xl border border-white/40 rounded-3xl p-6 sm:p-8 shadow-[0_16px_48px_0_rgba(0,0,0,0.45)] transition-all">
          
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-white drop-shadow-md">{t('loginTitle')}</h2>
            <p className="text-xs text-sky-100 font-medium mt-1 drop-shadow-sm">{t('loginSubtitle')}</p>
          </div>

          {/* Role Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-white/90 mb-2 text-center uppercase tracking-wider drop-shadow-sm">
              {t('selectRole')}
            </label>
            <div className="grid grid-cols-3 gap-2 bg-slate-950/20 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
              <button
                type="button"
                onClick={() => handleRoleSelect('waiter')}
                className={`flex flex-col items-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                  selectedRole === 'waiter'
                    ? 'bg-white/90 text-sky-900 shadow-lg border border-white/90 scale-[1.02] backdrop-blur-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <UserCheck className="w-5 h-5 mb-1 text-sky-600" />
                <span>{t('waiter')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('chef')}
                className={`flex flex-col items-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                  selectedRole === 'chef'
                    ? 'bg-white/90 text-amber-900 shadow-lg border border-white/90 scale-[1.02] backdrop-blur-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <ChefHat className="w-5 h-5 mb-1 text-amber-600" />
                <span>{t('chef')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('owner')}
                className={`flex flex-col items-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                  selectedRole === 'owner'
                    ? 'bg-white/90 text-purple-900 shadow-lg border border-white/90 scale-[1.02] backdrop-blur-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <ShieldCheck className="w-5 h-5 mb-1 text-purple-600" />
                <span>{t('owner')}</span>
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/90 mb-1 drop-shadow-sm">
                {t('username')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white/20 backdrop-blur-md border border-white/30 rounded-xl focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-sky-300 transition-all font-semibold text-white placeholder:text-white/60 shadow-inner"
                  placeholder="Enter staff username or ID"
                />
              </div>
            </div>

            {/* Auto-Resolved Staff Name Badge */}
            <div className="p-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl flex items-center justify-between text-xs shadow-inner">
              <span className="text-white/80 font-medium">Assigned Staff Name:</span>
              <span className="font-extrabold text-sky-200 text-sm drop-shadow">{currentResolvedName}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/90 mb-1 drop-shadow-sm">
                {t('password')}
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white/20 backdrop-blur-md border border-white/30 rounded-xl focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-sky-300 transition-all font-semibold text-white placeholder:text-white/60 shadow-inner"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-xl shadow-sky-600/40 flex items-center justify-center gap-2 text-sm transition-all transform active:scale-[0.99] border border-white/30"
            >
              <span>{t('loginButton')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="mt-6 pt-6 border-t border-white/20">
            <p className="text-[11px] font-semibold text-sky-100 text-center uppercase tracking-wider mb-2 drop-shadow-sm">
              {t('quickDemo')}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => login('waiter')}
                className="px-2 py-2 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl text-xs font-bold transition-all text-center backdrop-blur-md shadow-sm"
              >
                Log as Waiter
              </button>
              <button
                type="button"
                onClick={() => login('chef')}
                className="px-2 py-2 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl text-xs font-bold transition-all text-center backdrop-blur-md shadow-sm"
              >
                Log as Chef
              </button>
              <button
                type="button"
                onClick={() => login('owner')}
                className="px-2 py-2 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl text-xs font-bold transition-all text-center backdrop-blur-md shadow-sm"
              >
                Log as Owner
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-sky-100/90 font-medium py-2 z-10 drop-shadow">
        © 2026 Hotel Divya • Real-Time Restaurant Management System
      </footer>
    </div>
  );
};
