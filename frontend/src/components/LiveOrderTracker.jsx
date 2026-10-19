import React from 'react';
import { CheckCircle2, Clock, ChefHat, UtensilsCrossed, X, Sparkles } from 'lucide-react';
import { formatPrice } from '../utils/formatters';

export default function LiveOrderTracker({ activeOrder, onClose }) {
  if (!activeOrder) return null;

  const steps = [
    { key: 'PENDING', label: 'Order Sent', icon: Clock },
    { key: 'ACCEPTED', label: 'Accepted', icon: CheckCircle2 },
    { key: 'PREPARING', label: 'Cooking', icon: ChefHat },
    { key: 'SERVED', label: 'Served', icon: UtensilsCrossed },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'PENDING': return 0;
      case 'ACCEPTED': return 1;
      case 'PREPARING': return 2;
      case 'SERVED': return 3;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(activeOrder.status);

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-40 bg-gradient-to-br from-stone-950 via-stone-900 to-red-950 text-white rounded-3xl shadow-2xl border-2 border-amber-500/40 p-5 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-xs font-black uppercase tracking-wider text-amber-300">
            Live Order Tracking • {activeOrder.tableNumber}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-stone-400 hover:text-white p-1 rounded-xl hover:bg-white/10 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center text-xs mb-1">
          <span className="font-mono text-stone-300 font-bold">Ticket #{activeOrder.id}</span>
          <span className="font-serif-luxury font-black text-amber-400 text-sm">
            {formatPrice(activeOrder.totalAmount)}
          </span>
        </div>
        <p className="text-[11px] text-stone-400 truncate">
          {activeOrder.items?.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
        </p>
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
    </div>
  );
}
