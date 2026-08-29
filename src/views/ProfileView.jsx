import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { User, ShieldCheck, Mail, Clock, CheckCircle, Edit3, Save, X } from 'lucide-react';

export const ProfileView = () => {
  const { user, updateUserName } = useAuth();
  const { t } = useLanguage();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!user) return null;

  const handleSaveName = (e) => {
    e.preventDefault();
    if (nameInput.trim()) {
      updateUserName(nameInput.trim());
      setIsEditingName(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleCancelEdit = () => {
    setNameInput(user.name);
    setIsEditingName(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Staff Name updated successfully!</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-sky-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-sky-600/20 shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1 min-w-0">
            {isEditingName ? (
              <form onSubmit={handleSaveName} className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="px-3 py-1.5 text-sm font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 flex-1 max-w-xs"
                  placeholder="Enter full name"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-900 truncate">{user.name}</h2>
                <button
                  onClick={() => {
                    setNameInput(user.name);
                    setIsEditingName(true);
                  }}
                  className="p-1.5 text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors border border-sky-100"
                  title="Edit Name"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <p className="text-xs text-sky-600 font-semibold capitalize mt-0.5">{user.title}</p>
            <span className="inline-block mt-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
              {user.role} Account Active
            </span>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <h3 className="font-bold text-slate-700 uppercase tracking-wider">{t('staffProfile')}</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">{t('staffId')}</span>
              <div className="font-bold text-slate-800 mt-0.5">{user.id.toUpperCase()}</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">{t('email')}</span>
              <div className="font-bold text-slate-800 mt-0.5">{user.username}@grandhotel.com</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">{t('shift')}</span>
              <div className="font-bold text-slate-800 mt-0.5">Day Shift (8:00 AM - 4:00 PM)</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">{t('statusActive')}</span>
              <div className="font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Verified System Staff</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
