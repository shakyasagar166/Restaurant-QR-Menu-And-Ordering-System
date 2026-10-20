/**
 * WhatsApp Order & Bill Formatter and Dispatcher
 * Allows customers and admin to send rich formatted order receipts and tax bills via WhatsApp.
 */

export function generateWhatsAppOrderMessage(order, options = {}) {
  const { gstEnabled = false, gstRate = 5, discount = 0, gstin = '', fssai = '' } = options;

  const subtotal =
    (order.items || []).reduce((sum, item) => sum + item.price * item.quantity, 0) ||
    order.totalAmount ||
    0;

  const validDiscount = Math.min(Number(discount) || 0, subtotal);
  const taxable = Math.max(0, subtotal - validDiscount);
  const totalGst = gstEnabled ? (taxable * Number(gstRate || 0)) / 100 : 0;
  const grandTotal = Math.round(taxable + totalGst);

  const itemsList = (order.items || [])
    .map((item, idx) => {
      let line = `${idx + 1}. *${item.name}* × ${item.quantity} = ₹${item.price * item.quantity}`;
      if (item.specialInstructions && item.specialInstructions.trim()) {
        line += `\n   _(Note: ${item.specialInstructions.trim()})_`;
      }
      return line;
    })
    .join('\n');

  let msg = `*★ BIKANER EXPRESS FOODS ★*\n`;
  msg += `_Aman International Mall • Rooftop Dining, Mainpuri_\n`;
  if (gstin && gstin.trim()) {
    msg += `*GSTIN:* ${gstin.trim()}\n`;
  }
  msg += `------------------------------------\n`;
  msg += `🧾 *${gstEnabled ? 'TAX INVOICE / GUEST BILL' : 'ORDER RECEIPT & BILL'}*\n`;
  msg += `*Order #:* ${order.id || 'NEW'}\n`;
  msg += `*Table:* ${order.tableNumber || 'Table 1'}\n`;
  msg += `*Guest:* ${order.customerName || 'Walk-in Guest'}\n`;
  if (order.customerPhone) {
    msg += `*Phone:* ${order.customerPhone}\n`;
  }
  if (order.createdAt) {
    try {
      const dt = new Date(order.createdAt);
      msg += `*Date & Time:* ${dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}, ${dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}\n`;
    } catch {}
  }
  msg += `------------------------------------\n`;
  msg += `*Dishes Ordered:*\n${itemsList || 'No items'}\n`;
  msg += `------------------------------------\n`;
  msg += `*Item Total (Subtotal):* ₹${subtotal}\n`;

  if (validDiscount > 0) {
    msg += `*Special Discount:* -₹${validDiscount}\n`;
    if (gstEnabled) {
      msg += `*Taxable Value:* ₹${taxable.toFixed(2)}\n`;
    }
  }

  if (gstEnabled && gstRate > 0) {
    const halfRate = (gstRate / 2).toFixed(1);
    const halfGst = (totalGst / 2).toFixed(2);
    msg += `*CGST (${halfRate}%):* ₹${halfGst}\n`;
    msg += `*SGST (${halfRate}%):* ₹${halfGst}\n`;
    msg += `*Total GST (${gstRate}%):* ₹${totalGst.toFixed(2)}\n`;
  }

  msg += `*FINAL AMOUNT PAYABLE:* *₹${grandTotal}*\n`;
  msg += `*Payment Mode:* ${
    order.paymentMethod === 'ONLINE' || order.paymentStatus === 'PAID'
      ? 'ONLINE PAID ⚡'
      : 'CASH DUE 💵'
  }\n`;

  if (order.notes && order.notes.trim()) {
    msg += `*Special Request:* ${order.notes.trim()}\n`;
  }

  msg += `------------------------------------\n`;
  msg += `_Thank you for dining with Bikaner Express! 🙏_\n`;
  msg += `_100% Pure Vegetarian Rooftop Dining • Visit Again! 🌟_`;

  return msg;
}

export function openWhatsApp(phone, message) {
  const cleanPhone = phone ? String(phone).replace(/\D/g, '') : '';
  const encodedMsg = encodeURIComponent(message);

  let url = '';
  if (cleanPhone && cleanPhone.length === 10) {
    url = `https://wa.me/91${cleanPhone}?text=${encodedMsg}`;
  } else if (cleanPhone && cleanPhone.length > 10) {
    url = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
  } else {
    url = `https://api.whatsapp.com/send?text=${encodedMsg}`;
  }

  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }
}
