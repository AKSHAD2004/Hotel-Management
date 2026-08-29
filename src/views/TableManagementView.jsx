import React from 'react';
import { useOrders } from '../context/OrderContext';
import { useLanguage } from '../context/LanguageContext';
import { Grid, Users, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export const TableManagementView = () => {
  const { tables, orders } = useOrders();
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('tables')}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Live table status board. Updates automatically as orders progress.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Available ({tables.filter((t) => t.status === 'Available').length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Occupied ({tables.filter((t) => t.status !== 'Available').length})</span>
          </div>
        </div>
      </div>

      {/* Table Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        {tables.map((tbl) => {
          const isAvailable = tbl.status === 'Available';
          const activeOrder = orders.find((o) => o.tableNumber === tbl.tableNumber && o.status !== 'paid');

          let cardStyle = "bg-white border-slate-200 text-slate-800";
          let badgeStyle = "bg-emerald-100 text-emerald-800 border-emerald-200";

          if (tbl.status === 'Occupied') {
            cardStyle = "bg-amber-50/50 border-amber-200 shadow-sm";
            badgeStyle = "bg-amber-100 text-amber-900 border-amber-300";
          } else if (tbl.status === 'Order Preparing') {
            cardStyle = "bg-orange-50/50 border-orange-200 shadow-sm";
            badgeStyle = "bg-orange-100 text-orange-900 border-orange-300";
          } else if (tbl.status === 'Payment Pending') {
            cardStyle = "bg-purple-50/50 border-purple-200 shadow-sm";
            badgeStyle = "bg-purple-100 text-purple-900 border-purple-300";
          }

          return (
            <div
              key={tbl.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-all hover:shadow-md ${cardStyle}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">
                    T-{tbl.tableNumber}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Table {tbl.tableNumber}</h3>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold">
                      <Users className="w-3 h-3" />
                      <span>Cap: {tbl.capacity}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border uppercase tracking-wider inline-block ${badgeStyle}`}
                >
                  {tbl.status}
                </span>
              </div>

              {activeOrder ? (
                <div className="pt-2 border-t border-slate-200/80 text-[11px] space-y-1">
                  <div className="flex justify-between font-mono text-slate-500">
                    <span>Order:</span>
                    <span className="font-bold text-slate-800">#{activeOrder.orderId}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sky-700">
                    <span>Amount:</span>
                    <span>₹{activeOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-semibold">
                  Ready for guests
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
