import React, { useState } from 'react';
import { useOrders } from '../context/OrderContext';
import { useLanguage } from '../context/LanguageContext';
import { ChefHat, Clock, CheckCircle2, Flame, AlertCircle } from 'lucide-react';

export const ChefDashboard = () => {
  const { orders, updateChefOrderStatus } = useOrders();
  const { t } = useLanguage();

  // Chef Dashboard only shows orders in preparation ('new' or 'waiting').
  // Once Chef clicks 'Done', the order moves to 'Payment Pending' for Owner and disappears from Chef.
  const allActiveChefOrders = orders.filter(
    (o) => o.status === 'new' || o.status === 'waiting'
  ).sort((a, b) => {
    const priority = { new: 1, waiting: 2 };
    return (priority[a.status] || 99) - (priority[b.status] || 99);
  });

  const displayedOrders = allActiveChefOrders;

  const getTimeAgo = (isoString) => {
    if (!isoString) return '';
    const diffMins = Math.max(1, Math.floor((new Date() - new Date(isoString)) / 60000));
    return `${diffMins} ${t('timeAgo')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 text-white p-2.5 rounded-xl shadow-md shadow-amber-500/20">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t('chefBoardTitle')}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Unified Kitchen Display System • All Active Orders
            </p>
          </div>
        </div>

        {/* Single Merged Button */}
        <div className="flex items-center">
          <div className="px-4 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 flex items-center gap-2">
            <Flame className="w-4 h-4" />
            <span>All Active Kitchen Orders ({allActiveChefOrders.length})</span>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      {displayedOrders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 space-y-3">
          <ChefHat className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
          <h3 className="text-base font-bold text-slate-700">{t('noIncomingOrders')}</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            New orders placed by Waiters will automatically pop up here in real-time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedOrders.map((order) => {
            const isNew = order.status === 'new';
            const isWaiting = order.status === 'waiting';
            const isDone = order.status === 'done';

            return (
              <div
                key={order.orderId}
                className={`bg-white border rounded-2xl shadow-sm flex flex-col justify-between overflow-hidden transition-all ${
                  isNew
                    ? 'border-sky-300 ring-2 ring-sky-500/20'
                    : isWaiting
                    ? 'border-amber-300 ring-2 ring-amber-500/20'
                    : 'border-slate-200 opacity-90'
                }`}
              >
                {/* Order Header */}
                <div className={`p-4 border-b flex items-center justify-between ${
                  isNew ? 'bg-sky-50/70 border-sky-100' : isWaiting ? 'bg-amber-50/70 border-amber-100' : 'bg-slate-50 border-slate-100'
                }`}>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500">#{order.orderId}</span>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Table {order.tableNumber}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-medium block">
                      {getTimeAgo(order.createdAt)}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        isNew
                          ? 'bg-sky-600 text-white'
                          : isWaiting
                          ? 'bg-amber-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Items List Body */}
                <div className="p-4 space-y-3 flex-1">
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {t('itemsList')} ({order.items.length})
                    </span>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                        >
                          <span className="font-bold text-slate-800">{item.name}</span>
                          <span className="bg-slate-900 text-white text-xs font-bold px-2.5 py-0.5 rounded-lg">
                            × {item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Special Note Box */}
                  {order.notes && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Special Note:</span> {order.notes}
                      </div>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex justify-between">
                    <span>Waiter: {order.waiterName || 'Staff'}</span>
                    <span>Total items: {order.items.reduce((a, b) => a + b.quantity, 0)}</span>
                  </div>
                </div>

                {/* Chef Actions Footer */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex gap-2">
                  {isNew && (
                    <button
                      onClick={() => updateChefOrderStatus(order.orderId, 'waiting')}
                      className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <Flame className="w-4 h-4" />
                      <span>{t('markWaiting')}</span>
                    </button>
                  )}

                  {isWaiting && (
                    <button
                      onClick={() => updateChefOrderStatus(order.orderId, 'done')}
                      className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t('markDone')}</span>
                    </button>
                  )}

                  {isDone && (
                    <div className="w-full text-center py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200">
                      ✓ Food Prepared & Sent to Owner
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
