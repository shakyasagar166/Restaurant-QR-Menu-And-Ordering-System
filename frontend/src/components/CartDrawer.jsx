import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  Send,
  UtensilsCrossed,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Bell,
  User,
  Phone,
  UserCheck,
  CheckCircle2,
  CreditCard,
  Banknote,
} from 'lucide-react';
import { formatPrice } from '../utils/formatters';
import PaymentModal from './PaymentModal';

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
  const [customerName, setCustomerName] = useState(() => {
    try {
      return localStorage.getItem('bikaner_guest_name') || '';
    } catch {
      return '';
    }
  });

  const [customerPhone, setCustomerPhone] = useState(() => {
    try {
      return localStorage.getItem('bikaner_guest_phone') || '';
    } catch {
      return '';
    }
  });

  const [cookingNotes, setCookingNotes] = useState('');
  const [validationError, setValidationError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ name: false, phone: false });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState(null);

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

    const trimmedName = customerName.trim();
    const cleanPhone = customerPhone.trim().replace(/\D/g, '');

    let hasError = false;
    const newFieldErrors = { name: false, phone: false };

    if (!trimmedName || trimmedName.length < 2) {
      newFieldErrors.name = true;
      hasError = true;
    }

    if (!cleanPhone || cleanPhone.length !== 10) {
      newFieldErrors.phone = true;
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(newFieldErrors);
      if (newFieldErrors.name && newFieldErrors.phone) {
        setValidationError('⚠️ Kripya apna Naam aur 10-digit Mobile Number daalein (Order ke liye anivarya hai)!');
      } else if (newFieldErrors.name) {
        setValidationError('⚠️ Kripya apna Naam (Customer Name) darj karein!');
      } else {
        setValidationError('⚠️ Kripya sahi 10-digit Mobile Number daalein (10 anko ka number zaroori hai)!');
      }
      return;
    }

    setValidationError('');
    setFieldErrors({ name: false, phone: false });

    // Save for next time
    try {
      localStorage.setItem('bikaner_guest_name', trimmedName);
      localStorage.setItem('bikaner_guest_phone', cleanPhone);
    } catch (err) {}

    const orderData = {
      tableNumber: tableNumber || 'T-1',
      customerName: trimmedName,
      customerPhone: cleanPhone,
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

    setPendingOrderData(orderData);
    setIsPaymentModalOpen(true);
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
            <h4 className="font-brand font-bold text-stone-900 text-lg mb-1">
              Your plate is empty
            </h4>
            <p className="text-xs text-stone-500 mb-6 max-w-xs leading-relaxed">
              Browse our categories (like Indian Breads, Paneer Curries, Drinks) and add delicious pure veg dishes to your order!
            </p>
            <button
              onClick={onClose}
              className="bg-red-700 hover:bg-red-800 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-md transition"
            >
              ← Explore Menu
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Table Selector Bar */}
            <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-black uppercase tracking-wider text-stone-800 font-brand">
                  Dining Table:
                </span>
              </div>
              <select
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="bg-white border-2 border-amber-400 rounded-xl px-3 py-1 font-brand font-black text-amber-950 text-xs focus:outline-none shadow-xs"
              >
                {[...Array(20)].map((_, i) => (
                  <option key={i + 1} value={`T-${i + 1}`}>
                    Table {i + 1}
                  </option>
                ))}
                <option value="Takeaway">Takeaway</option>
              </select>
            </div>

            {/* 🔥 HIGH-CONTRAST HIGHLIGHTED COMPULSORY GUEST DETAILS CARD 🔥 */}
            <div
              className={`rounded-2xl sm:rounded-3xl p-4 sm:p-5 border-2 transition-all duration-300 shadow-md ${
                validationError
                  ? 'bg-red-50/90 border-red-500 ring-2 ring-red-400/40'
                  : 'bg-gradient-to-br from-amber-100/90 via-orange-50/80 to-amber-50 border-amber-400 shadow-amber-500/10'
              }`}
            >
              {/* Header Ribbon */}
              <div className="flex items-center justify-between pb-2.5 mb-3.5 border-b border-amber-300/80">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-red-800 text-amber-300 flex items-center justify-center font-bold shadow-xs">
                    <UserCheck className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="font-brand font-black text-xs sm:text-sm text-stone-900 block leading-tight">
                      Customer Details (अनिवार्य)
                    </span>
                    <span className="text-[10px] text-stone-600 font-semibold block">
                      Kitchen bill &amp; table service record
                    </span>
                  </div>
                </div>
                <span className="bg-red-700 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-xs animate-pulse font-brand shrink-0">
                  * REQUIRED
                </span>
              </div>

              {/* Validation Alert Banner if empty */}
              {validationError && (
                <div className="bg-red-600 text-white rounded-xl p-2.5 mb-3 flex items-center gap-2 text-xs font-bold shadow-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 animate-bounce" />
                  <span>{validationError}</span>
                </div>
              )}

              <div className="space-y-3">
                {/* 1. Customer Name */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-black uppercase tracking-wider text-stone-900 flex items-center gap-1 font-brand">
                      <User className="w-3.5 h-3.5 text-amber-800" />
                      <span>Aapka Naam (Customer Name)</span>
                      <span className="text-red-600 text-sm font-black">*</span>
                    </label>
                    {customerName.trim().length >= 2 && (
                      <span className="text-[10px] text-emerald-800 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Valid
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="उदा. Shivam Shakya / Sharma Ji"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: false }));
                      if (validationError) setValidationError('');
                    }}
                    className={`w-full bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-stone-900 placeholder-stone-400 focus:outline-none transition shadow-xs border-2 ${
                      fieldErrors.name
                        ? 'border-red-500 ring-2 ring-red-300 bg-red-50/50'
                        : 'border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-400'
                    }`}
                    required
                  />
                </div>

                {/* 2. Customer Phone Number */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-black uppercase tracking-wider text-stone-900 flex items-center gap-1 font-brand">
                      <Phone className="w-3.5 h-3.5 text-amber-800" />
                      <span>Mobile Number (मोबाइल नंबर)</span>
                      <span className="text-red-600 text-sm font-black">*</span>
                    </label>
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                        customerPhone.trim().replace(/\D/g, '').length === 10
                          ? 'bg-emerald-100 text-emerald-800 flex items-center gap-0.5'
                          : 'text-stone-600 bg-stone-200/90'
                      }`}
                    >
                      {customerPhone.trim().replace(/\D/g, '').length === 10
                        ? '✓ 10 Digits Done'
                        : `${customerPhone.trim().replace(/\D/g, '').length}/10 Digits`}
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 font-mono font-bold text-xs sm:text-sm text-stone-500 select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="9058605348"
                      value={customerPhone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setCustomerPhone(val);
                        if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: false }));
                        if (validationError) setValidationError('');
                      }}
                      className={`w-full bg-white rounded-xl pl-11 pr-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold text-stone-900 placeholder-stone-400 focus:outline-none transition shadow-xs border-2 ${
                        fieldErrors.phone
                          ? 'border-red-500 ring-2 ring-red-300 bg-red-50/50'
                          : 'border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-400'
                      }`}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-amber-200/80 text-[10px] text-stone-700 flex items-center gap-1 font-medium">
                <span className="text-amber-800 font-bold">🔒 Note:</span>
                <span>Order submit karne ke liye naam aur 10-digit mobile number anivarya hai.</span>
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
          <div className="p-4 sm:p-6 border-t border-amber-100 bg-stone-50 space-y-3">
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-stone-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span className="font-bold text-stone-900">{formatPrice(gst)}</span>
              </div>
              <div className="flex justify-between text-base font-brand font-black text-stone-900 pt-2 border-t border-stone-200">
                <span>Total Amount</span>
                <span className="text-red-700 text-xl font-sans font-black">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            {/* Payment Options Available at next step */}
            <div className="bg-gradient-to-r from-blue-50/90 via-amber-50/70 to-emerald-50/80 border border-amber-300/80 rounded-xl p-2.5 flex items-center justify-between text-[11px] shadow-2xs">
              <div className="flex items-center gap-1.5 font-bold text-stone-800">
                <CreditCard className="w-4 h-4 text-blue-700" />
                <span>Payment Options:</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-black">
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-300">
                  ⚡ Online (Razorpay)
                </span>
                <span className="text-stone-400 font-bold">/</span>
                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-300">
                  💵 Cash
                </span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isPlacingOrder}
              className="w-full bg-gradient-to-r from-red-700 via-red-800 to-amber-700 hover:from-red-800 hover:to-amber-800 text-white font-brand font-black py-3.5 sm:py-4 rounded-2xl shadow-xl shadow-red-900/30 flex items-center justify-center gap-2.5 transition-all active:scale-98 disabled:opacity-50 text-sm sm:text-base border-2 border-amber-400 cursor-pointer"
            >
              {isPlacingOrder ? (
                <span className="animate-pulse">Confirming Order...</span>
              ) : (
                <>
                  <Bell className="w-5 h-5 text-amber-300 animate-bounce" />
                  <span className="tracking-wide uppercase">CONFIRM ORDER &amp; CHOOSE PAYMENT ➔</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full text-center text-xs font-bold text-stone-600 hover:text-stone-900 py-1 flex items-center justify-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-stone-500" />
              <span>← Continue Adding Dishes (और डिश जोड़ें)</span>
            </button>

            <p className="text-[10px] sm:text-[11px] text-center text-stone-500 flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              Kitchen will immediately receive order with an audio bell chime.
            </p>
          </div>
        )}
      </div>

      {/* Payment Selection Modal (Razorpay Online vs Cash on Delivery) */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        orderData={pendingOrderData}
        onConfirmOrder={(finalOrderPayload) => {
          setIsPaymentModalOpen(false);
          onPlaceOrder(finalOrderPayload);
        }}
        isPlacingOrder={isPlacingOrder}
      />
    </div>
  );
}
