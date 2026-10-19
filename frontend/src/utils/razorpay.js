/**
 * Razorpay Payment Gateway Integration Utility for Bikaner Express
 * Supports UPI (GPay, PhonePe, Paytm), Debit/Credit Cards, and NetBanking.
 */

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
    // Graceful fallback for local development or adblockers blocking checkout.razorpay.com
    const confirmFallback = window.confirm(
      `Razorpay SDK load nahi ho saka (ho sakta hai ad-blocker ya network issue ho).\n\nKya aap Test Online Payment Simulate karna chahte hain?`
    );
    if (confirmFallback) {
      const mockPaymentId = `pay_mock_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
      onSuccess({
        razorpay_payment_id: mockPaymentId,
        is_simulated: true,
      });
      return;
    } else {
      if (onFailure) onFailure(new Error('Razorpay script could not be loaded'));
      return;
    }
  }

  // Razorpay Key ID - standard public test key or custom key from env
  const razorpayKey =
    import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag';

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
      // response contains razorpay_payment_id, etc.
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
