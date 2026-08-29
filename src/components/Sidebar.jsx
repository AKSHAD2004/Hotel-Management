import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard,
  PlusCircle,
  Clock,
  CheckCircle2,
  Receipt,
  History,
  Grid,
  BarChart3,
  Bell,
  User,
  LogOut,
  ChefHat,
  Utensils
} from 'lucide-react';

export const Sidebar = ({ activeView, setActiveView, isMobileOpen, setIsMobileOpen }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  if (!user) return null;

  // Build menu items based on role
  const getMenuItems = () => {
    switch (user.role) {
      case 'waiter':
        return [
          { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
          { id: 'new_order', label: t('newOrder'), icon: PlusCircle },
          { id: 'active_orders', label: t('activeOrders'), icon: Clock },
          { id: 'order_history', label: t('orderHistory'), icon: History },
          { id: 'profile', label: t('profile'), icon: User }
        ];
      case 'chef':
        return [
          { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
          { id: 'incoming_orders', label: t('incomingOrders'), icon: Utensils },
          { id: 'waiting_orders', label: t('waitingOrders'), icon: Clock },
          { id: 'completed_orders', label: t('completedOrders'), icon: CheckCircle2 },
          { id: 'profile', label: t('profile'), icon: User }
        ];
      case 'owner':
        return [
          { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
          { id: 'payment_pending', label: t('paymentPending'), icon: Receipt },
          { id: 'payment_history', label: t('paymentHistory'), icon: History },
          { id: 'tables', label: t('tables'), icon: Grid },
          { id: 'reports', label: t('reports'), icon: BarChart3 },
          { id: 'profile', label: t('profile'), icon: User }
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const handleSelectView = (viewId) => {
    setActiveView(viewId);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar (lg screens) */}
      <aside className="hidden lg:flex lg:flex-col justify-between w-64 bg-white border-r border-slate-200 shrink-0 min-h-[calc(100vh-65px)]">
        <div className="p-4">
          {/* Staff Info Card */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
              {user.role === 'chef' ? <ChefHat className="w-5 h-5" /> : user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-slate-800 truncate">{user.name}</div>
              <div className="text-[11px] font-medium text-sky-600 capitalize truncate">{user.role} Dashboard</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectView(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Dock (displayed at bottom of screen on mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-1.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:hidden">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleSelectView(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? 'text-sky-600 font-extrabold bg-sky-50/90'
                  : 'text-slate-500 font-medium hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-sky-600 scale-110' : 'text-slate-400'}`} />
              <span className="text-[10px] leading-tight truncate max-w-[62px] text-center">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
