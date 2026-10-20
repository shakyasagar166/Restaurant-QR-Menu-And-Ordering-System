import React from 'react';
import {
  CheckCircle2,
  Clock,
  ChefHat,
  UtensilsCrossed,
  X,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { formatPrice, formatTime, getTimeAgo } from '../utils/formatters';

export default function LiveOrderTracker({ activeOrder, onClose, onClearOrder }) {
  if (!activeOrder) return null;

  const steps = [
    { key: 'PENDING', label: 'Order Sent', icon: Clock },
    { key: 'ACCEPTED', label: 'Accepted', icon: CheckCircle2 },
    { key: 'PREPARING', label: 'Cooking', icon: ChefHat },
    { key: 'SERVED', label: 'Served', icon: UtensilsCrossed },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'ACCEPTED':
        return 1;
      case 'PREPARING':
        return 2;
      case 'SERVED':
        return 3;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(activeOrder.status);

  return (
    <div className="fixed bottom-3 right-3 left-3 sm:left-auto sm:right-6 sm:w-96 z-40 bg-gradient-to-br from-stone-950 via-stone-900 to-red-950 text-white rounded-3xl shadow-2xl border-2 border-amber-500/40 p-4 sm:p-5 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 gap-2">
        <div className="flex items-center gap-2 truncate">
          <button
            onClick={onClose}
            className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-amber-300 hover:text-white px-2 py-1 rounded-xl text-xs font-bold transition active:scale-95 shrink-0"
            title="Menu par wapas jayein"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-300" />
            <span>← Back</span>
          </button>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
          <span className="text-xs font-black uppercase tracking-wider text-amber-300 truncate">
            Order Status • {activeOrder.tableNumber}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-stone-400 hover:text-white p-1 rounded-xl hover:bg-white/10 transition shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center text-xs mb-1">
          <span className="font-mono text-stone-300 font-bold">Ticket #{activeOrder.id}</span>
          <span className="font-brand font-black text-amber-400 text-sm">
            {formatPrice(activeOrder.totalAmount)}
          </span>
        </div>

        {activeOrder.createdAt && (
          <div className="flex justify-between items-center text-[10px] text-stone-400 mb-1.5 pb-1 border-b border-white/5 font-mono">
            <span className="flex items-center gap-1 text-stone-300">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>{formatTime(activeOrder.createdAt)}</span>
            </span>
            <span className="font-bold text-amber-300">
              {getTimeAgo(activeOrder.createdAt)}
            </span>
          </div>
        )}

        <div className="text-[11px] text-stone-300 max-h-16 overflow-y-auto no-scrollbar">
          {activeOrder.items?.map((i, idx) => (
            <span key={idx} className="mr-2 inline-block">
              <span className="font-bold text-amber-300">{i.quantity}x</span> {i.name}
              {i.specialInstructions && (
                <span className="text-[10px] text-amber-200/90 ml-1 font-semibold bg-white/10 px-1 py-0.2 rounded">
                  📝 {i.specialInstructions}
                </span>
              )}
              {idx < (activeOrder.items?.length || 0) - 1 ? ',' : ''}
            </span>
          ))}
        </div>

        {/* Payment Method Badge */}
        <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
          <span className="text-stone-400">Payment:</span>
          {activeOrder.paymentMethod === 'ONLINE' || activeOrder.paymentStatus === 'PAID' ? (
            <span className="inline-flex items-center gap-1 font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-500/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Paid via Razorpay {activeOrder.paymentId ? `(#${activeOrder.paymentId.slice(-6)})` : ''}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-lg border border-amber-500/40">
              <span>💵 Cash on Delivery / Counter</span>
            </span>
          )}
        </div>
      </div>

      {/* Progress Step Nodes */}
      <div className="grid grid-cols-4 gap-1 relative mb-3">
        {steps.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center text-center">
              <div
                className={`w-8 h-8 rounded-2xl flex items-center justify-center text-xs font-bold transition-all mb-1 ${
                  isCurrent
                    ? 'bg-amber-400 text-stone-950 ring-4 ring-amber-400/30 scale-110 shadow-lg'
                    : isDone
                    ? 'bg-emerald-500 text-white'
                    : 'bg-stone-800 text-stone-500'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`text-[10px] font-bold leading-tight ${
                  isCurrent ? 'text-amber-300 font-black' : isDone ? 'text-stone-200' : 'text-stone-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {activeOrder.status === 'PENDING' && (
        <div className="bg-red-950/80 border border-red-500/40 rounded-2xl p-2.5 text-center text-xs text-amber-200 font-medium">
          🔔 Kitchen bell ringing! Staff will accept shortly.
        </div>
      )}

      {activeOrder.status === 'ACCEPTED' && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-2xl p-2.5 text-center text-xs text-emerald-200 font-medium">
          🎉 Kitchen accepted your order! Cooking started.
        </div>
      )}

      {activeOrder.status === 'PREPARING' && (
        <div className="bg-blue-950/80 border border-blue-500/40 rounded-2xl p-2.5 text-center text-xs text-blue-200 font-medium">
          👨‍🍳 Chef is actively preparing your fresh dishes!
        </div>
      )}

      {activeOrder.status === 'SERVED' && (
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 border-2 border-emerald-400 rounded-2xl p-2.5 text-center text-xs text-emerald-200 font-bold shadow-lg animate-bounce">
          🍽️✨ Order Complete &amp; Served at your table! Enjoy your royal meal!
        </div>
      )}

      {activeOrder.status === 'CANCELLED' && (
        <div className="bg-rose-950/80 border border-rose-500/40 rounded-2xl p-2.5 text-center text-xs text-rose-200 font-medium">
          ❌ This order was cancelled. Please contact staff or waiter.
        </div>
      )}

      {/* Action Buttons: Browse Menu (Minimize) & Done */}
      <div className="mt-3 pt-2.5 border-t border-white/10 space-y-2">
        <button
          type="button"
          onClick={onClose}
          className="w-full bg-white/10 hover:bg-white/20 text-amber-300 hover:text-white font-bold py-2.5 px-3 rounded-2xl flex items-center justify-center gap-2 text-xs border border-white/15 transition active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
          <span>← Back to Menu (मेनू देखें / और डिश जोड़ें)</span>
        </button>

        {activeOrder.status === 'SERVED' || activeOrder.status === 'CANCELLED' ? (
          <button
            type="button"
            onClick={onClearOrder}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-black py-2.5 px-3 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-md border border-emerald-400/50 transition active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>Order Complete • Start New Order (नया आर्डर शुरू करें)</span>
          </button>
        ) : (
          <div className="text-center text-[10px] text-stone-300/80 px-1 leading-relaxed">
            💡 <span className="text-stone-200 font-semibold">Aapka order kitchen me chal raha hai.</span> Menu dekhne ke liye &apos;Back&apos; dabayein. Wapas aane ke liye screen par diye <span className="text-amber-300 font-bold">&quot;Active Order&quot;</span> button par click karein.
          </div>
        )}
      </div>
    </div>
  );
}
