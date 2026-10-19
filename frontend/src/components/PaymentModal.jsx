import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  X,
  Sparkles,
  User,
  Phone,
  AlertCircle,
  Loader2,
  QrCode,
} from 'lucide-react';
import { initiateRazorpayPayment } from '../utils/razorpay';

export default function PaymentModal({
  isOpen,
  onClose,
  orderData,
  onConfirmOrder,
  isPlacingOrder,
}) {
  const [selectedMethod, setSelectedMethod] = useState('ONLINE'); // 'ONLINE' or 'CASH'
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Lock background body scroll completely when payment modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
      };
    }
  }, [isOpen]);

  if (!isOpen || !orderData) return null;

  const totalAmount = orderData.totalAmount || 0;
  const formatPrice = (val) => `₹${Number(val).toLocaleString('en-IN')}`;

  const handleProceed = async () => {
    setPaymentError('');

    if (selectedMethod === 'CASH') {
      // 1. CASH ON DELIVERY
      const finalOrderPayload = {
        ...orderData,
        paymentMethod: 'CASH',
        paymentStatus: 'PENDING_CASH',
        paymentId: null,
      };
      onConfirmOrder(finalOrderPayload);
    } else {
      // 2. ONLINE PAYMENT VIA RAZORPAY
      setIsProcessingPayment(true);

      initiateRazorpayPayment({
        amount: totalAmount,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        tableNumber: orderData.tableNumber,
        onSuccess: (response) => {
          setIsProcessingPayment(false);
          const paymentId = response.razorpay_payment_id || `pay_${Date.now()}`;
          const finalOrderPayload = {
            ...orderData,
            paymentMethod: 'ONLINE',
            paymentStatus: 'PAID',
            paymentId: paymentId,
          };
          onConfirmOrder(finalOrderPayload);
        },
        onFailure: (error) => {
          setIsProcessingPayment(false);
          setPaymentError(
            error?.description || error?.message || 'Payment fail ho gaya. Aap dobara try karein ya Cash on Delivery chunein.'
          );
        },
        onDismiss: () => {
          setIsProcessingPayment(false);
        },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-stone-950/95 backdrop-blur-md overflow-hidden overscroll-contain animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-amber-300 overflow-hidden flex flex-col max-h-[92vh] z-10">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-red-950 via-stone-900 to-amber-950 text-white flex items-center justify-between border-b border-amber-500/30">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              disabled={isProcessingPayment || isPlacingOrder}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 transition"
              title="Wapas jayein"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 font-brand">
                  Final Step • Table {orderData.tableNumber}
                </span>
              </div>
              <h3 className="font-brand font-black text-base sm:text-lg text-white">
                Choose Payment Method
              </h3>
              <p className="text-[11px] text-amber-200/80">
                भुगतान का तरीका चुनें (Online या Cash on Delivery)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessingPayment || isPlacingOrder}
            className="text-stone-400 hover:text-white p-1 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-stone-900">
          {/* Guest & Order Summary Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 rounded-2xl p-3.5 border border-amber-200 shadow-2xs">
            <div className="flex items-center justify-between border-b border-amber-200/70 pb-2.5 mb-2.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-stone-800">
                <User className="w-3.5 h-3.5 text-amber-700" />
                <span>{orderData.customerName}</span>
                <span className="text-stone-400">•</span>
                <Phone className="w-3 h-3 text-amber-700" />
                <span>+91 {orderData.customerPhone}</span>
              </div>
              <span className="font-black text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-lg text-[10px]">
                {orderData.tableNumber}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-stone-600 block">Total Payable Amount</span>
                <span className="text-xs text-stone-500">
                  {orderData.items?.length || 0} items (incl. 5% GST)
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-red-700 font-sans tracking-tight">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Error Alert if any */}
          {paymentError && (
            <div className="p-3 bg-red-50 border-2 border-red-300 rounded-2xl flex items-start gap-2.5 text-red-800 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Payment Error</p>
                <p className="text-[11px]">{paymentError}</p>
              </div>
            </div>
          )}

          {/* 2 Options Heading */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-stone-700 flex items-center gap-1.5 font-brand mb-2.5">
              <span>Select Payment Option (2 विकल्प उपलब्ध हैं):</span>
            </label>

            <div className="space-y-3">
              {/* Option 1: Razorpay Online Payment */}
              <div
                onClick={() => setSelectedMethod('ONLINE')}
                className={`relative rounded-2xl p-4 border-2 cursor-pointer transition-all ${
                  selectedMethod === 'ONLINE'
                    ? 'border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-300'
                    : 'border-stone-200 hover:border-blue-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-xl ${
                        selectedMethod === 'ONLINE'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-brand font-black text-sm sm:text-base text-stone-900">
                          Online Payment (ऑनलाइन पेमेंट)
                        </h4>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                          ⚡ Powered by Razorpay
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-1">
                        Pay instantly via <b>UPI</b> (Google Pay, PhonePe, Paytm), <b>Debit/Credit Cards</b>, NetBanking.
                      </p>

                      {/* Payment Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-700 shadow-2xs">
                          GPay
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-700 shadow-2xs">
                          PhonePe
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-700 shadow-2xs">
                          Paytm UPI
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-700 shadow-2xs">
                          Visa / RuPay / MC
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-1">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedMethod === 'ONLINE'
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-stone-300'
                      }`}
                    >
                      {selectedMethod === 'ONLINE' && <CheckCircle2 className="w-4 h-4 fill-white text-blue-600" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Option 2: Cash on Delivery / Pay at Counter */}
              <div
                onClick={() => setSelectedMethod('CASH')}
                className={`relative rounded-2xl p-4 border-2 cursor-pointer transition-all ${
                  selectedMethod === 'CASH'
                    ? 'border-amber-600 bg-amber-50/70 shadow-md ring-2 ring-amber-300'
                    : 'border-stone-200 hover:border-amber-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-xl ${
                        selectedMethod === 'CASH'
                          ? 'bg-amber-600 text-white'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-brand font-black text-sm sm:text-base text-stone-900">
                          Cash on Delivery (कैश ऑन डिलीवरी)
                        </h4>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                          💵 Pay at Table / Counter
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-1">
                        Khana khane ke baad table par waiter ko ya billing counter par direct Cash payment karein.
                      </p>
                      <div className="flex items-center gap-1.5 mt-2 text-[11px] font-bold text-amber-800">
                        <span>✓ No advance payment needed</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-1">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedMethod === 'CASH'
                          ? 'border-amber-600 bg-amber-600 text-white'
                          : 'border-stone-300'
                      }`}
                    >
                      {selectedMethod === 'CASH' && <CheckCircle2 className="w-4 h-4 fill-white text-amber-600" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Assurance footer note */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Safe & Instant Kitchen Confirmation with Royal Bell</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 flex flex-col gap-2.5">
          <button
            onClick={handleProceed}
            disabled={isProcessingPayment || isPlacingOrder}
            className={`w-full py-3.5 sm:py-4 rounded-2xl font-brand font-black text-sm sm:text-base shadow-xl flex items-center justify-center gap-2.5 transition active:scale-98 cursor-pointer text-white ${
              selectedMethod === 'ONLINE'
                ? 'bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-800 hover:to-indigo-800 shadow-blue-900/30 border-2 border-blue-400'
                : 'bg-gradient-to-r from-red-700 via-amber-800 to-red-800 hover:from-red-800 hover:to-amber-900 shadow-red-900/30 border-2 border-amber-400'
            }`}
          >
            {isProcessingPayment ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Opening Razorpay Gateway...</span>
              </>
            ) : isPlacingOrder ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Confirming Order with Kitchen...</span>
              </>
            ) : selectedMethod === 'ONLINE' ? (
              <>
                <CreditCard className="w-5 h-5 text-amber-300" />
                <span>Pay {formatPrice(totalAmount)} via Razorpay</span>
              </>
            ) : (
              <>
                <Banknote className="w-5 h-5 text-amber-300" />
                <span>Confirm Order (Cash on Delivery) • {formatPrice(totalAmount)}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isProcessingPayment || isPlacingOrder}
            className="w-full text-center text-xs font-bold text-stone-600 hover:text-stone-900 py-1 transition flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-stone-500" />
            <span>← Go Back & Edit Dishes (वापस जाएं)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
