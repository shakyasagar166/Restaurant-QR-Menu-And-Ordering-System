/**
 * Razorpay Payment Gateway Integration Utility for Bikaner Express
 * Supports UPI (GPay, PhonePe, Paytm), Debit/Credit Cards, and NetBanking.
 */

export const getSavedRazorpayKey = () => {
  try {
    const stored = localStorage.getItem('bikaner_razorpay_key_id');
    if (stored && stored.trim().length > 5) return stored.trim();
  } catch {}
  return import.meta.env.VITE_RAZORPAY_KEY_ID || '';
};

export const saveRazorpayKey = (key) => {
  try {
    if (key && key.trim()) {
      localStorage.setItem('bikaner_razorpay_key_id', key.trim());
    } else {
      localStorage.removeItem('bikaner_razorpay_key_id');
    }
  } catch {}
};

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load official Razorpay SDK script from CDN.');
      resolve(false);
    };

    document.body.appendChild(script);
  });
};

export const initiateRazorpayPayment = async ({
  amount, // in Rupees (e.g., 450)
  customerName,
  customerPhone,
  tableNumber,
  onSuccess,
  onFailure,
  onDismiss,
}) => {
  const isLoaded = await loadRazorpayScript();

  if (!isLoaded || !window.Razorpay) {
    if (onFailure) {
      onFailure(new Error('Razorpay SDK load nahi ho saka (Network ya Adblocker issue).'));
    }
    return;
  }

  // Razorpay Key ID - from localStorage or env
  const razorpayKey = getSavedRazorpayKey();

  if (!razorpayKey) {
    if (onFailure) {
      onFailure(new Error('Razorpay Key ID nahi mili. Kripya Test Mode Simulator use karein ya apni Key enter karein.'));
    }
    return;
  }

  const amountInPaise = Math.round(Number(amount) * 100);

  const options = {
    key: razorpayKey,
    amount: amountInPaise,
    currency: 'INR',
    name: 'Bikaner Express',
    description: `Table ${tableNumber || 'T-1'} • Dining & Beverages`,
    image: 'https://cdn-icons-png.flaticon.com/512/3448/3448609.png',
    prefill: {
      name: customerName || 'Valued Guest',
      contact: customerPhone ? customerPhone.replace(/\D/g, '') : '',
    },
    notes: {
      restaurant: 'Bikaner Express Rooftop',
      table: tableNumber || 'T-1',
      customer_name: customerName,
      customer_phone: customerPhone,
    },
    theme: {
      color: '#991b1b', // Royal Crimson
    },
    modal: {
      ondismiss: () => {
        if (onDismiss) onDismiss();
      },
    },
    handler: function (response) {
      // response contains razorpay_payment_id, razorpay_order_id, razorpay_signature
      if (onSuccess) {
        onSuccess(response);
      }
    },
  };

  try {
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response) {
      console.error('Razorpay payment failure:', response.error);
      if (onFailure) {
        onFailure(response.error);
      }
    });
    rzp.open();
  } catch (err) {
    console.error('Razorpay initialization error:', err);
    if (onFailure) {
      onFailure(err);
    }
  }
};
