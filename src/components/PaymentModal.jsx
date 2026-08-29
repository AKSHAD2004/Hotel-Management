import React, { useState } from 'react';
import { useOrders } from '../context/OrderContext';
import { useLanguage } from '../context/LanguageContext';
import { X, CreditCard, Banknote, QrCode, CheckCircle2, Printer } from 'lucide-react';

export const PaymentModal = ({ order, onClose }) => {
  const { processPayment } = useOrders();
  const { t } = useLanguage();

  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [discountInput, setDiscountInput] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!order) return null;

  const discountVal = Number(discountInput) || 0;
  const grandTotal = Math.max(0, order.subtotal + order.tax - discountVal);

  const handleConfirmPayment = () => {
    processPayment(order.orderId, paymentMethod, discountVal);
    setIsSuccess(true);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-sky-400 font-semibold uppercase tracking-wider">
              {t('paymentModalTitle')}
            </span>
            <h3 className="text-lg font-bold">Order #{order.orderId}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {isSuccess ? (
            /* Success Confirmation State */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900">{t('paymentSuccessTitle')}</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  {t('paymentSuccessMsg')}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Order ID:</span>
                  <span className="font-bold text-slate-800">#{order.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Table Number:</span>
                  <span className="font-bold text-slate-800">Table {order.tableNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Method:</span>
                  <span className="font-bold text-slate-800 uppercase">{paymentMethod}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-sm">
                  <span className="text-slate-700">Total Paid:</span>
                  <span className="text-emerald-700">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handlePrintReceipt}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 border border-slate-300 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>{t('printReceipt')}</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-semibold text-xs shadow-md shadow-sky-600/20 transition-colors"
                >
                  Done & Close
                </button>
              </div>
            </div>
          ) : (
            /* Order Breakdown & Payment Selection Form */
            <>
              {/* Order Info Bar */}
              <div className="flex items-center justify-between bg-sky-50 border border-sky-100 p-3 rounded-xl">
                <div>
                  <span className="text-xs text-sky-700 font-medium">Table Assignment</span>
                  <div className="text-sm font-bold text-sky-900">Table {order.tableNumber}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-sky-700 font-medium">Order Status</span>
                  <div className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md inline-block">
                    {t('statusPaymentPending')}
                  </div>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Order Items Breakdown
                </h4>
                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <div className="font-semibold text-slate-800">{item.name}</div>
                        <div className="text-[11px] text-slate-400">₹{item.price} × {item.quantity}</div>
                      </div>
                      <div className="font-bold text-slate-900">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Totals */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>{t('subtotal')}</span>
                  <span className="font-semibold">₹{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{t('tax')}</span>
                  <span className="font-semibold">₹{order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 pt-1 border-t border-slate-200">
                  <span>{t('discount')} (₹)</span>
                  <input
                    type="number"
                    min="0"
                    max={order.subtotal}
                    value={discountInput}
                    onChange={(e) => setDiscountInput(e.target.value)}
                    className="w-20 px-2 py-1 text-right bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="0"
                  />
                </div>
                <div className="flex justify-between items-center text-base font-bold text-slate-900 pt-2 border-t border-slate-300">
                  <span>{t('grandTotal')}</span>
                  <span className="text-sky-700 text-lg">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {t('paymentMethod')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border font-semibold text-xs transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-sky-600 bg-sky-50 text-sky-800 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <QrCode className="w-5 h-5 mb-1 text-sky-600" />
                    <span>{t('upi')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border font-semibold text-xs transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Banknote className="w-5 h-5 mb-1 text-emerald-600" />
                    <span>{t('cash')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border font-semibold text-xs transition-all ${
                      paymentMethod === 'card'
                        ? 'border-purple-600 bg-purple-50 text-purple-800 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mb-1 text-purple-600" />
                    <span>{t('card')}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('confirmPayment')}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
