import React from 'react';
import { useOrders } from '../context/OrderContext';
import { useLanguage } from '../context/LanguageContext';
import { BarChart3, IndianRupee, ShoppingBag, Award, PieChart, TrendingUp } from 'lucide-react';

export const ReportsView = () => {
  const { orders } = useOrders();
  const { t } = useLanguage();

  const paidOrders = orders.filter((o) => o.status === 'paid');
  const totalSales = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const totalTaxCollected = paidOrders.reduce((sum, o) => sum + o.tax, 0);
  const avgOrderVal = paidOrders.length > 0 ? totalSales / paidOrders.length : 0;

  // Calculate top ordered items
  const itemMap = {};
  orders.forEach((ord) => {
    ord.items.forEach((it) => {
      if (!itemMap[it.name]) {
        itemMap[it.name] = { count: 0, revenue: 0 };
      }
      itemMap[it.name].count += it.quantity;
      itemMap[it.name].revenue += it.price * it.quantity;
    });
  });

  const topItems = Object.entries(itemMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Table-wise revenue breakdown
  const tableMap = {};
  paidOrders.forEach((ord) => {
    if (!tableMap[ord.tableNumber]) tableMap[ord.tableNumber] = 0;
    tableMap[ord.tableNumber] += ord.total;
  });

  const tableWiseSales = Object.entries(tableMap).map(([tableNumber, total]) => ({
    tableNumber: Number(tableNumber),
    total
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('reportsTitle')}</h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time revenue, top selling dishes & performance analytics</p>
        </div>
        <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
          <BarChart3 className="w-6 h-6" />
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('todaysSales')}</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">₹{totalSales.toFixed(2)}</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Net revenue collected</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('totalOrdersCount')}</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{orders.length}</div>
          <p className="text-[11px] text-sky-600 font-semibold mt-1">{paidOrders.length} Paid & closed</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('avgOrderValue')}</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">₹{avgOrderVal.toFixed(2)}</div>
          <p className="text-[11px] text-purple-600 font-semibold mt-1">Per transaction average</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">GST Tax Collected</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">₹{totalTaxCollected.toFixed(2)}</div>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">5% Statutory GST</p>
        </div>
      </div>

      {/* Two Column Section: Top Selling Items & Table Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Selling Food Items */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-800">{t('topItems')}</h3>
          </div>

          <div className="space-y-3">
            {topItems.map((item, index) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-800">
                  <span>#{index + 1} {item.name}</span>
                  <span className="font-bold text-sky-700">{item.count} orders (₹{item.revenue})</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full"
                    style={{ width: `${Math.min(100, (item.count / (topItems[0]?.count || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Table-Wise Sales Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <PieChart className="w-5 h-5 text-purple-500" />
            <h3 className="text-sm font-bold text-slate-800">{t('tableWiseSales')}</h3>
          </div>

          {tableWiseSales.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No completed table sales recorded yet.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {tableWiseSales.map((tbl) => (
                <div
                  key={tbl.tableNumber}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs"
                >
                  <span className="font-bold text-slate-800">Table {tbl.tableNumber}</span>
                  <span className="font-extrabold text-emerald-700">₹{tbl.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
