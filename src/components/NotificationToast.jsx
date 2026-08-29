import React from 'react';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { Bell, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const NotificationToast = () => {
  const { toasts, removeNotification } = useNotification();
  const { user } = useAuth();

  const visibleToasts = toasts.filter((toast) => {
    if (user && user.role === 'chef') return false; // Disable all popups for Chef
    if (!toast.targetRoles) return true;
    if (!user || !user.role) return true;
    return toast.targetRoles.includes(user.role);
  });

  if (visibleToasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full px-4 pointer-events-none">
      {visibleToasts.map((toast) => {
        let bgClass = "bg-white border-blue-100 text-slate-800 shadow-xl";
        let icon = <Bell className="w-5 h-5 text-blue-500" />;

        if (toast.type === 'warning') {
          bgClass = "bg-amber-50 border-amber-200 text-amber-900 shadow-xl";
          icon = <AlertTriangle className="w-5 h-5 text-amber-600 animate-bounce" />;
        } else if (toast.type === 'success') {
          bgClass = "bg-emerald-50 border-emerald-200 text-emerald-900 shadow-xl";
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
        } else if (toast.type === 'info') {
          bgClass = "bg-sky-50 border-sky-200 text-sky-900 shadow-xl";
          icon = <Info className="w-5 h-5 text-sky-600" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border transition-all transform translate-y-0 duration-300 ${bgClass}`}
          >
            <div className="mt-0.5 shrink-0">{icon}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold">{toast.title}</h4>
              <p className="text-xs mt-1 text-slate-600 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeNotification(toast.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
