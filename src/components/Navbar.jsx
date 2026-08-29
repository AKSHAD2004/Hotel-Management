import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Globe, LogOut, User, Menu, X, UtensilsCrossed } from 'lucide-react';

export const Navbar = ({ onToggleMobileSidebar, isMobileSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'waiter':
        return <span className="bg-sky-100 text-sky-800 border border-sky-200 text-xs font-semibold px-2.5 py-1 rounded-full">{t('waiter')}</span>;
      case 'chef':
        return <span className="bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold px-2.5 py-1 rounded-full">{t('chef')}</span>;
      case 'owner':
        return <span className="bg-purple-100 text-purple-800 border border-purple-200 text-xs font-semibold px-2.5 py-1 rounded-full">{t('owner')}</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 px-4 lg:px-6 py-3 transition-all">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="bg-sky-600 text-white p-2 rounded-xl shadow-sm">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-lg leading-none tracking-tight">
                {t('appTitle')}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Real-Time Restaurant Platform
              </p>
            </div>
          </div>
        </div>

        {/* Right Actions: Language Switcher, Role Badge & User Profile */}
        <div className="flex items-center gap-3 lg:gap-4">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 text-xs font-medium transition-colors"
            >
              <Globe className="w-4 h-4 text-sky-600" />
              <span className="uppercase font-semibold">{language}</span>
              <span className="text-slate-400">▼</span>
            </button>

            {langMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-36 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 text-xs"
                onClick={() => setLangMenuOpen(false)}
              >
                <button
                  onClick={() => changeLanguage('en')}
                  className={`w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center justify-between ${language === 'en' ? 'font-bold text-sky-600' : 'text-slate-700'}`}
                >
                  <span>English</span>
                  {language === 'en' && '✓'}
                </button>
                <button
                  onClick={() => changeLanguage('mr')}
                  className={`w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center justify-between ${language === 'mr' ? 'font-bold text-sky-600' : 'text-slate-700'}`}
                >
                  <span>मराठी (Marathi)</span>
                  {language === 'mr' && '✓'}
                </button>
                <button
                  onClick={() => changeLanguage('hi')}
                  className={`w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center justify-between ${language === 'hi' ? 'font-bold text-sky-600' : 'text-slate-700'}`}
                >
                  <span>हिंदी (Hindi)</span>
                  {language === 'hi' && '✓'}
                </button>
              </div>
            )}
          </div>

          {/* Role Badge */}
          <div className="hidden sm:block">
            {getRoleBadge(user?.role)}
          </div>

          {/* User Info & Logout */}
          {user && (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <div className="hidden md:block text-right">
                <div className="text-xs font-semibold text-slate-800">{user.name}</div>
                <div className="text-[10px] text-slate-500 capitalize">{user.title}</div>
              </div>

              <button
                onClick={logout}
                title={t('logout')}
                className="flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors border border-rose-100"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t('logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
