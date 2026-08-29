import React, { useState } from 'react';
import { useOrders } from '../context/OrderContext';
import { useLanguage } from '../context/LanguageContext';
import { PaymentModal } from '../components/PaymentModal';
import {
  IndianRupee,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Receipt,
  Grid,
  TrendingUp,
  ArrowUpRight,
  Eye
} from 'lucide-react';

export const OwnerDashboard = ({ setActiveView }) => {
  const { orders, tables } = useOrders();
  const { t } = useLanguage();

  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);

  // Group all unpaid orders by table number to guarantee EXACTLY ONE BILL / ONE CARD per table
  const pendingPaymentOrders = React.useMemo(() => {
    const tableMap = {};
    orders.forEach((o) => {
      if (o.status !== 'paid') {
        const tNum = o.tableNumber;
        if (!tableMap[tNum]) {
          tableMap[tNum] = {
            ...o,
            items: o.items.map((i) => ({ ...i }))
          };
        } else {
          // Merge items from additional orders for the same table
          o.items.forEach((newItem) => {
            const existingIdx = tableMap[tNum].items.findIndex((i) => i.id === newItem.id);
            if (existingIdx > -1) {
              tableMap[tNum].items[existingIdx] = {
                ...tableMap[tNum].items[existingIdx],
                quantity: tableMap[tNum].items[existingIdx].quantity + newItem.quantity
              };
            } else {
              tableMap[tNum].items.push({ ...newItem });
            }
          });
          tableMap[tNum].subtotal = Math.round((tableMap[tNum].subtotal + o.subtotal) * 100) / 100;
          tableMap[tNum].tax = Math.round((tableMap[tNum].tax + o.tax) * 100) / 100;
          tableMap[tNum].total = tableMap[tNum].subtotal + tableMap[tNum].tax;
          if (o.notes) {
            tableMap[tNum].notes = tableMap[tNum].notes
              ? `${tableMap[tNum].notes} | ${o.notes}`
              : o.notes;
          }
        }
      }
    });
    return Object.values(tableMap);
  }, [orders]);

  // Paid completed orders
  const paidOrders = orders.filter((o) => o.status === 'paid');

  // Metrics
  const todaysSalesTotal = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const activeOrdersCount = orders.filter((o) => o.status !== 'paid').length;
  const occupiedTablesCount = tables.filter((t) => t.status !== 'Available').length;

  return (
    <div className="space-y-6">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('owner')} {t('dashboard')}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Hotel operational overview, live order payments, table status & analytics
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveView('payment_pending')}
            className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Receipt className="w-4 h-4 text-sky-600" />
            <span>{t('paymentPending')} ({pendingPaymentOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveView('reports')}
            className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span>{t('reports')}</span>
          </button>
        </div>
      </div>

      {/* Overview Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Today's Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('todaysSales')}
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              ₹{todaysSalesTotal.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{paidOrders.length} Paid orders closed</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Pending Payments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('totalPendingPayments')}
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {pendingPaymentOrders.length}
            </div>
            <div className="text-[11px] font-semibold text-amber-600 mt-1">
              Orders awaiting payment
            </div>
          </div>
        </div>

        {/* Metric 3: Active Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('totalActiveOrders')}
            </span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl border border-sky-100">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {activeOrdersCount}
            </div>
            <div className="text-[11px] font-semibold text-sky-600 mt-1">
              Orders in kitchen or preparing
            </div>
          </div>
        </div>

        {/* Metric 4: Table Occupancy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('totalTables')}
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
              <Grid className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {occupiedTablesCount} / {tables.length}
            </div>
            <div className="text-[11px] font-semibold text-purple-600 mt-1">
              Tables currently occupied
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Section: Payment Pending Orders */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-600" />
              <span>{t('pendingPaymentsTitle')}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Food prepared by Chef. Process payment to mark completed and release table.
            </p>
          </div>

          <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
            {pendingPaymentOrders.length} Pending
          </span>
        </div>

        {pendingPaymentOrders.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 stroke-1" />
            <p className="text-xs font-semibold text-slate-600">All prepared orders have been paid!</p>
            <p className="text-[11px] text-slate-400">New finished kitchen orders will appear here automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingPaymentOrders.map((ord) => (
              <div
                key={ord.orderId}
                className="bg-slate-50 border border-amber-200/80 rounded-xl p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start border-b border-slate-200 pb-2">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono">#{ord.orderId}</span>
                    <h4 className="text-base font-extrabold text-slate-900">Table {ord.tableNumber}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      ₹{ord.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="text-xs space-y-1 text-slate-700 max-h-32 overflow-y-auto pr-1">
                  {ord.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{it.name} × {it.quantity}</span>
                      <span className="font-semibold">₹{it.price * it.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200 flex gap-2">
                  <button
                    onClick={() => setSelectedOrderForPayment(ord)}
                    className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>{t('processPayment')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Completed Payments Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">{t('paymentHistory')}</h3>
          <button
            onClick={() => setActiveView('payment_history')}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {paidOrders.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No completed payment history yet.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Table</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Payment Method</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paidOrders.slice(0, 5).map((ord) => (
                  <tr key={ord.orderId} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-800">#{ord.orderId}</td>
                    <td className="p-3 font-semibold text-slate-700">Table {ord.tableNumber}</td>
                    <td className="p-3 text-slate-600">{ord.items.length} items</td>
                    <td className="p-3 font-bold text-emerald-700">₹{ord.total.toFixed(2)}</td>
                    <td className="p-3 font-semibold uppercase text-slate-700">{ord.paymentMethod || 'N/A'}</td>
                    <td className="p-3">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        PAID
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Modal Trigger */}
      {selectedOrderForPayment && (
        <PaymentModal
          order={selectedOrderForPayment}
          onClose={() => setSelectedOrderForPayment(null)}
        />
      )}
    </div>
  );
};
