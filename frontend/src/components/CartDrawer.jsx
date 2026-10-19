import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, Send, UtensilsCrossed, AlertCircle, Sparkles, ArrowLeft, Bell } from 'lucide-react';
import { formatPrice } from '../utils/formatters';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onDeleteDish,
  onClearCart,
  tableNumber,
  setTableNumber,
  onPlaceOrder,
  isPlacingOrder,
}) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [cookingNotes, setCookingNotes] = useState('');

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gst = Math.round(subtotal * 0.05); // 5% GST
  const grandTotal = subtotal + gst;

  const quickInstructions = [
    '🌶️ Medium Spicy',
    '🌿 Jain (No Onion/Garlic)',
    '🧈 Extra Butter',
    '🍋 Extra Lemon & Onions',
  ];

  const handleAddQuickNote = (note) => {
    if (cookingNotes.includes(note)) return;
    setCookingNotes((prev) => (prev ? `${prev}, ${note}` : note));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const orderData = {
      tableNumber: tableNumber || 'T-1',
      customerName: customerName.trim() || 'Guest Diner',
      customerPhone: customerPhone.trim(),
      notes: cookingNotes.trim(),
      totalAmount: grandTotal,
      items: cart.map((item) => ({
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        specialInstructions: '',
      })),
    };

    onPlaceOrder(orderData);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity"
      ></div>

      {/* Luxury Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-amber-200/80 flex items-center justify-between bg-gradient-to-r from-red-950 via-stone-900 to-amber-950 text-white">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex items-center gap-1 bg-white/15 hover:bg-white/25 text-amber-300 hover:text-white px-2.5 py-1 rounded-xl text-xs font-bold transition active:scale-95 border border-white/10"
              title="Menu par wapas jayein"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-300" />
              <span>← Back (वापस)</span>
            </button>
            <div className="border-l border-white/20 pl-2">
              <h3 className="font-brand font-black text-sm sm:text-base text-white tracking-wide">
                Your Table Tray
              </h3>
              <span className="text-[10px] text-amber-300 font-bold block">
                {tableNumber} • Rooftop Restaurant
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cart Body */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-3xl bg-amber-100/80 text-amber-800 flex items-center justify-center text-4xl mb-4 shadow-inner">
              🍲
            </div>
            <h4 className="font-serif-luxury font-bold text-stone-900 text-lg mb-1">
              Your plate is empty
            </h4>
            <p className="text-xs text-stone-500 mb-6 max-w-xs leading-relaxed">
              Browse our categories (like Indian Breads, Paneer Curries, Drinks) and add delicious pure veg dishes to your order!
            </p>
            <button
              onClick={onClose}
              className="bg-red-700 hover:bg-red-800 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-md transition"
            >
              Explore Menu
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Table & Guest Card */}
            <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/50 rounded-2xl p-4 border border-amber-300/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-950">
                  Dining Table:
                </span>
                <select
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="bg-white border border-amber-300 rounded-xl px-2.5 py-1 font-black text-amber-950 text-xs focus:outline-none shadow-2xs"
                >
                  {[...Array(20)].map((_, i) => (
                    <option key={i + 1} value={`T-${i + 1}`}>
                      Table {i + 1}
                    </option>
                  ))}
                  <option value="Takeaway">Takeaway</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-200/60">
                <div>
                  <label className="text-[10px] font-bold text-stone-600 block mb-0.5">Guest Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Sharma Ji"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-600 block mb-0.5">Mobile (Optional)</label>
                  <input
                    type="tel"
                    placeholder="Mobile number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Selected Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-black text-stone-500 uppercase tracking-widest pb-1 border-b border-stone-100">
                <span>Selected Items ({cart.length})</span>
                <button
                  onClick={onClearCart}
                  className="text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-xl text-[11px] font-bold normal-case flex items-center gap-1.5 transition border border-red-200/60"
                  title="Saari dishes tray se hatayein"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  <span>Clear All (सब हटाएं)</span>
                </button>
              </div>

              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-stone-50/80 hover:bg-amber-50/30 rounded-2xl p-3 border border-stone-200/80 flex items-center justify-between gap-2.5 transition group"
                >
                  {/* Left: Dish Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block shrink-0"></span>
                      <h5 className="font-bold text-stone-900 truncate text-xs sm:text-sm">
                        {item.name}
                      </h5>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-stone-500">
                      <span>{formatPrice(item.price)} each</span>
                      <span className="text-stone-300">•</span>
                      <span className="font-black text-red-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center bg-white rounded-xl overflow-hidden border border-amber-300/80 shadow-2xs">
                    <button
                      onClick={() => onRemoveFromCart(item.id)}
                      className={`p-1.5 transition active:scale-90 flex items-center justify-center ${
                        item.quantity === 1
                          ? 'bg-red-50 hover:bg-red-100 text-red-600'
                          : 'hover:bg-stone-100 text-stone-700'
                      }`}
                      title={item.quantity === 1 ? 'Dish ko tray se hataayein (Remove)' : 'Quantity kam karein (-1)'}
                    >
                      {item.quantity === 1 ? (
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      ) : (
                        <Minus className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <span className="px-2 text-xs font-black text-stone-900 select-none min-w-[20px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onAddToCart(item)}
                      className="p-1.5 hover:bg-stone-100 text-stone-700 transition active:scale-90"
                      title="Quantity badhayein (+1)"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Dedicated 1-Click Remove (Delete) Button */}
                  <button
                    onClick={() => (onDeleteDish ? onDeleteDish(item.id) : onRemoveFromCart(item.id))}
                    className="w-8 h-8 rounded-xl bg-red-100/80 hover:bg-red-600 text-red-700 hover:text-white flex items-center justify-center transition shrink-0 border border-red-200/80 shadow-2xs"
                    title="Is dish ko tray se poori tarah hataayein (Remove item)"
                    aria-label="Remove dish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Special Instructions & Quick Chips */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-800 block">
                Special Kitchen Instructions:
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {quickInstructions.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleAddQuickNote(chip)}
                    className="text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 px-2.5 py-1 rounded-lg transition"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
              <textarea
                rows={2}
                placeholder="e.g. Less spicy, Jain preparation, hot rotis only..."
                value={cookingNotes}
                onChange={(e) => setCookingNotes(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-3 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              ></textarea>
            </div>
          </div>
        )}

        {/* Footer Billing & Ring Bell Action */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-amber-100 bg-stone-50 space-y-3.5">
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-stone-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span className="font-bold text-stone-900">{formatPrice(gst)}</span>
              </div>
              <div className="flex justify-between text-base font-serif-luxury font-black text-stone-900 pt-2 border-t border-stone-200">
                <span>Total Amount</span>
                <span className="text-red-700 text-xl font-sans font-black">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isPlacingOrder}
              className="w-full bg-gradient-to-r from-red-700 via-red-800 to-amber-700 hover:from-red-800 hover:to-amber-800 text-white font-brand font-black py-4 rounded-2xl shadow-xl shadow-red-900/30 flex items-center justify-center gap-2.5 transition-all active:scale-98 disabled:opacity-50 text-sm sm:text-base border-2 border-amber-400 cursor-pointer"
            >
              {isPlacingOrder ? (
                <span className="animate-pulse">Sending to Kitchen...</span>
              ) : (
                <>
                  <Bell className="w-5 h-5 text-amber-300 animate-bounce" />
                  <span className="tracking-wide uppercase">PLACE ORDER &amp; RING BELL 🔔</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full text-center text-xs font-bold text-stone-600 hover:text-stone-900 py-1.5 flex items-center justify-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-stone-500" />
              <span>← Continue Adding Dishes (और डिश जोड़ें)</span>
            </button>

            <p className="text-[11px] text-center text-stone-500 flex items-center justify-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              Kitchen will immediately receive order with an audio bell chime.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
