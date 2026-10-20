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
  Smartphone,
  Building,
  Key,
  Check,
  Flame,
  Zap,
} from 'lucide-react';
import {
  initiateRazorpayPayment,
  getSavedRazorpayKey,
  saveRazorpayKey,
} from '../utils/razorpay';
import { bellPlayer } from '../utils/sound';

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

  // Razorpay Test Simulator State
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulatorTab, setSimulatorTab] = useState('upi'); // 'upi', 'card', 'netbanking'
  const [isSimulatingSuccess, setIsSimulatingSuccess] = useState(false);

  // Custom Key Configuration State
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState('');
  const [keySavedMessage, setKeySavedMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCustomKeyInput(getSavedRazorpayKey());
      setPaymentError('');
      setIsSimulatorOpen(false);
      setIsSimulatingSuccess(false);

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

  const handleSaveCustomKey = () => {
    saveRazorpayKey(customKeyInput);
    setKeySavedMessage('Razorpay Key successfully saved!');
    setTimeout(() => setKeySavedMessage(''), 3000);
  };

  // 1. Triggered when user confirms from the Simulator Modal
  const handleSimulatePaymentSuccess = () => {
    setIsSimulatingSuccess(true);
    bellPlayer.playOrderBell();

    setTimeout(() => {
      setIsSimulatingSuccess(false);
      setIsSimulatorOpen(false);

      const mockPaymentId = `pay_test_${Math.random().toString(36).substring(2, 8).toUpperCase()}_${Date.now().toString(36).slice(-4).toUpperCase()}`;

      const finalOrderPayload = {
        ...orderData,
        paymentMethod: 'ONLINE',
        paymentStatus: 'PAID',
        paymentId: mockPaymentId,
      };

      onConfirmOrder(finalOrderPayload);
    }, 700);
  };

  // 2. Triggered when user simulates payment failure
  const handleSimulatePaymentFailure = () => {
    setIsSimulatorOpen(false);
    setPaymentError(
      'Payment declined by bank / Customer cancelled transaction (Test Simulation Error). Aap dobara try karein ya Cash on Delivery chunein.'
    );
  };

  // 3. Main Proceed Button Click handler
  const handleProceed = async () => {
    setPaymentError('');

    if (selectedMethod === 'CASH') {
      // CASH ON DELIVERY
      const finalOrderPayload = {
        ...orderData,
        paymentMethod: 'CASH',
        paymentStatus: 'PENDING_CASH',
        paymentId: null,
      };
      onConfirmOrder(finalOrderPayload);
      return;
    }

    // ONLINE PAYMENT
    const savedKey = getSavedRazorpayKey();

    // If user has saved a real key starting with rzp_test_ or rzp_live_, try official popup
    if (savedKey && savedKey.startsWith('rzp_') && savedKey.length > 15) {
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
          // If official key failed (e.g. invalid key), offer instant test simulator
          setPaymentError(
            error?.description ||
              error?.message ||
              'Official Razorpay error: Key invalid ya verification fail. Kripya niche diye Test Simulator se test karein.'
          );
        },
        onDismiss: () => {
          setIsProcessingPayment(false);
        },
      });
    } else {
      // Open the interactive Razorpay Sandbox Test Simulator
      setIsSimulatorOpen(true);
    }
  };

  return (
    <>
      {/* ============================================================== */}
      {/* MAIN PAYMENT SELECTION MODAL                                  */}
      {/* ============================================================== */}
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
                  Table {orderData.tableNumber}
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
                <div className="flex-1">
                  <p className="font-bold">Payment Alert</p>
                  <p className="text-[11px] mt-0.5">{paymentError}</p>
                  <button
                    onClick={() => {
                      setPaymentError('');
                      setIsSimulatorOpen(true);
                    }}
                    className="mt-2 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    ⚡ Open Test Sandbox Simulator (3-5 Bar Test Karein)
                  </button>
                </div>
              </div>
            )}

            {/* Quick Test Mode Banner for User Testing */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-3 border border-blue-400/30 shadow-md">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    <Zap className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <h5 className="font-brand font-black text-xs text-amber-300">
                      🧪 Razorpay Testing Mode (Free Sandbox)
                    </h5>
                    <p className="text-[11px] text-slate-300">
                      Aap bina real paise kate 3–5 baar online payment test kar sakte hain!
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSimulatorOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black text-xs font-brand shadow-sm transition active:scale-95 shrink-0"
                >
                  ⚡ Test Now
                </button>
              </div>
            </div>

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
                        {selectedMethod === 'ONLINE' && (
                          <CheckCircle2 className="w-4 h-4 fill-white text-blue-600" />
                        )}
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
                        {selectedMethod === 'CASH' && (
                          <CheckCircle2 className="w-4 h-4 fill-white text-amber-600" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Optional Key Configuration Drawer */}
            <div className="pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setShowKeyConfig(!showKeyConfig)}
                className="text-[11px] text-stone-500 hover:text-stone-800 font-bold flex items-center gap-1.5 transition"
              >
                <Key className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {showKeyConfig
                    ? 'Hide Razorpay Key Configuration ▲'
                    : 'Aapke paas apna Razorpay Key ID hai? Click karein ▼'}
                </span>
              </button>

              {showKeyConfig && (
                <div className="mt-2.5 p-3 bg-stone-100 rounded-xl border border-stone-300 text-xs space-y-2">
                  <p className="text-[11px] text-stone-600">
                    Aap Razorpay Dashboard se apni <b>Test Key ID</b> (jaise <code>rzp_test_...</code>) yahan daal sakte hain:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customKeyInput}
                      onChange={(e) => setCustomKeyInput(e.target.value)}
                      placeholder="rzp_test_xxxxxxxxxxxx"
                      className="flex-1 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono focus:outline-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleSaveCustomKey}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition"
                    >
                      Save Key
                    </button>
                  </div>
                  {keySavedMessage && (
                    <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> {keySavedMessage}
                    </p>
                  )}
                </div>
              )}
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
                  <span>Connecting to Razorpay...</span>
                </>
              ) : isPlacingOrder ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Confirming Order with Kitchen...</span>
                </>
              ) : selectedMethod === 'ONLINE' ? (
                <>
                  <CreditCard className="w-5 h-5 text-amber-300" />
                  <span>Pay {formatPrice(totalAmount)} Online (Razorpay)</span>
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

      {/* ============================================================== */}
      {/* AUTHENTIC RAZORPAY TEST SIMULATOR MODAL (FOR TESTING 3-5 TIMES)*/}
      {/* ============================================================== */}
      {isSimulatorOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-stone-950/90 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-300 flex flex-col max-h-[95vh]">
            {/* Official Razorpay Header */}
            <div className="bg-[#0c2340] text-white p-4 flex items-center justify-between border-b border-blue-900">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-sm text-white shadow">
                  R
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm tracking-wide text-white">
                      Razorpay Checkout
                    </span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-400 text-stone-950">
                      TEST SANDBOX
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Bikaner Express Rooftop • Table {orderData.tableNumber}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSimulatorOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Amount Strip */}
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block">
                  Amount to Pay
                </span>
                <span className="text-xl font-black text-slate-900 font-sans">
                  {formatPrice(totalAmount)}
                </span>
              </div>
              <div className="text-right text-xs">
                <span className="text-slate-600 font-bold block">{orderData.customerName}</span>
                <span className="text-slate-400 text-[11px]">+91 {orderData.customerPhone}</span>
              </div>
            </div>

            {/* Tabs for Payment Modes */}
            <div className="flex border-b border-slate-200 bg-white text-xs font-bold">
              <button
                type="button"
                onClick={() => setSimulatorTab('upi')}
                className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition ${
                  simulatorTab === 'upi'
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>UPI / QR</span>
              </button>
              <button
                type="button"
                onClick={() => setSimulatorTab('card')}
                className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition ${
                  simulatorTab === 'card'
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setSimulatorTab('netbanking')}
                className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition ${
                  simulatorTab === 'netbanking'
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Net Banking</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
              {simulatorTab === 'upi' && (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 text-center">
                    <p className="font-bold text-xs">📲 Instant UPI Apps (Simulated)</p>
                    <p className="text-[11px] text-blue-700 mt-0.5">
                      PhonePe, Google Pay, Paytm, BHIM UPI se test karein
                    </p>
                  </div>

                  {/* UPI Apps Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-xl border-2 border-slate-200 bg-white text-center hover:border-blue-500 transition cursor-pointer">
                      <div className="text-base font-black text-purple-700">PhonePe</div>
                      <span className="text-[10px] text-slate-500 font-bold">UPI Fast</span>
                    </div>
                    <div className="p-2.5 rounded-xl border-2 border-slate-200 bg-white text-center hover:border-blue-500 transition cursor-pointer">
                      <div className="text-base font-black text-blue-600">GPay</div>
                      <span className="text-[10px] text-slate-500 font-bold">Google Pay</span>
                    </div>
                    <div className="p-2.5 rounded-xl border-2 border-slate-200 bg-white text-center hover:border-blue-500 transition cursor-pointer">
                      <div className="text-base font-black text-sky-600">Paytm</div>
                      <span className="text-[10px] text-slate-500 font-bold">Paytm UPI</span>
                    </div>
                  </div>

                  {/* Mock UPI QR Scan */}
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-white border border-slate-300">
                        <QrCode className="w-7 h-7 text-slate-800" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-xs">Dynamic UPI QR Code</p>
                        <p className="text-[11px] text-slate-500">
                          Scan & Pay via any UPI App
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-bold">
                      ACTIVE
                    </span>
                  </div>
                </div>
              )}

              {simulatorTab === 'card' && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-900 text-white rounded-xl shadow-inner font-mono text-xs space-y-2">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>TEST CREDIT CARD</span>
                      <span className="text-amber-400 font-bold">VISA / RUPAY</span>
                    </div>
                    <div className="text-base tracking-widest font-black text-white py-1">
                      4111 •••• •••• 1111
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>{orderData.customerName || 'GUEST'}</span>
                      <span>EXP: 12/28</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 text-center">
                    Test Mode: Valid test card details are pre-loaded. Click Simulate Success to proceed.
                  </p>
                </div>
              )}

              {simulatorTab === 'netbanking' && (
                <div className="grid grid-cols-2 gap-2">
                  {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((b) => (
                    <div
                      key={b}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-700 hover:border-blue-500 transition cursor-pointer text-center"
                    >
                      {b}
                    </div>
                  ))}
                </div>
              )}

              {/* Informative Test Tip */}
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <b>Test Sandbox Notice:</b> Real paise nahi katenge! Success button click karte hi Admin console me <b>RED Alert</b> check kar sakte hain.
                </span>
              </div>
            </div>

            {/* Test Simulation Buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
              <button
                type="button"
                onClick={handleSimulatePaymentSuccess}
                disabled={isSimulatingSuccess}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
              >
                {isSimulatingSuccess ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying with Razorpay Server...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>✅ Simulate Successful Payment ({formatPrice(totalAmount)})</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSimulatePaymentFailure}
                disabled={isSimulatingSuccess}
                className="w-full py-2 rounded-xl border border-red-300 hover:bg-red-50 text-red-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>❌ Simulate Failed Payment (Test Failure Flow)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
