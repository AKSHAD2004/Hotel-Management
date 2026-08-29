import React, { useState } from 'react';
import { useOrders } from '../context/OrderContext';
import { useLanguage } from '../context/LanguageContext';
import { Search, History, Filter } from 'lucide-react';

export const OrderHistoryView = () => {
  const { orders } = useOrders();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `table ${ord.tableNumber}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || ord.status === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('orderHistory')}</h2>
          <p className="text-xs text-slate-500 mt-0.5">Comprehensive audit log of all restaurant orders</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID or Table..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="WAITING">Waiting (Preparing)</option>
            <option value="DONE">Done</option>
            <option value="PAID">Paid</option>
          </select>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <History className="w-8 h-8 mx-auto stroke-1" />
            <p className="text-xs font-semibold">No orders match your filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Table</th>
                  <th className="p-3">Items Summary</th>
                  <th className="p-3">Grand Total</th>
                  <th className="p-3">Date / Time</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((ord) => (
                  <tr key={ord.orderId} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900">#{ord.orderId}</td>
                    <td className="p-3 font-semibold text-slate-800">Table {ord.tableNumber}</td>
                    <td className="p-3 text-slate-600 max-w-xs truncate">
                      {ord.items.map((i) => `${i.name} (${i.quantity})`).join(', ')}
                    </td>
                    <td className="p-3 font-bold text-sky-700">₹{ord.total.toFixed(2)}</td>
                    <td className="p-3 text-slate-400 text-[11px]">
                      {new Date(ord.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          ord.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'done'
                            ? 'bg-purple-100 text-purple-800'
                            : ord.status === 'waiting'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
