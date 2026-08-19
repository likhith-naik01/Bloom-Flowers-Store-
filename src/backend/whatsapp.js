/**
 * Helper to generate pre-filled WhatsApp deep-link for Admin to message customer
 * Supports location-based delivery charges, bulk order free delivery disclaimers, and Razorpay payment links.
 * Uses api.whatsapp.com/send to prevent mobile redirect JSON errors.
 */
export function generateAdminWhatsAppLink(order, customDeliveryCharge, isBulkOrder) {
  if (!order || !order.customerPhone) return '#';

  // Sanitize phone number (strip non-digits, remove leading zeros, ensure country code)
  let cleanPhone = String(order.customerPhone).replace(/\D/g, '');
  cleanPhone = cleanPhone.replace(/^0+/, ''); // Remove leading zero if entered as 09876543210

  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone; // Default to India (+91) if 10 digits
  }

  const items = order.items || [];
  const itemsSubtotal = items.reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
    0
  );

  const itemsList = items
    .map(
      (item, idx) =>
        `  ${idx + 1}. *${item.nameEn || item.name || 'Item'}* x ${item.quantity || 1} ${item.unit || 'unit'} = ₹${(item.price || 0) * (item.quantity || 1)}`
    )
    .join('\n');

  const noteText = order.orderNote ? `\n\n📝 *Customer Note:* "${order.orderNote}"` : '';

  // Determine bulk order & delivery charge
  const bulk = isBulkOrder !== undefined ? isBulkOrder : !!order.isBulkOrder;
  const deliveryFee = bulk
    ? 0
    : customDeliveryCharge !== undefined
    ? Number(customDeliveryCharge)
    : Number(order.deliveryCharge || 0);
  const finalTotal = itemsSubtotal + deliveryFee;

  let deliveryText = '';
  if (bulk) {
    deliveryText = `🎉 *Delivery Charge:* FREE (Special Bulk Order Discount!)`;
  } else if (deliveryFee > 0) {
    deliveryText = `🚚 *Delivery Charge:* ₹${deliveryFee} (Based on delivery location)`;
  } else {
    deliveryText = `🚚 *Delivery Charge:* Pending location confirmation`;
  }

  const payMethod = order.payment_method || order.paymentMethod || 'cod';
  const advanceAmt = Number(order.advance_amount || order.advanceAmount || Math.round(finalTotal / 2));
  const remainingAmt = Number(order.remaining_amount || order.remainingAmount || (finalTotal - advanceAmt));
  const payLink = order.payment_link || order.paymentLink;

  let paymentText = '';
  if (payMethod === 'online') {
    paymentText = `💳 *Payment Method:* Pay Online (Razorpay) - Verified Paid ✓`;
  } else if (payMethod === 'half_advance') {
    paymentText = `⚡ *Payment Method:* Pay Half Advance\n  • *Advance Paid Upfront:* ₹${advanceAmt} ✓\n  • *Balance Due on Delivery:* ₹${remainingAmt}`;
    if (payLink) paymentText += `\n  • *Pay Balance Link:* ${payLink}`;
  } else if (payMethod === 'pay_later') {
    paymentText = `📱 *Payment Method:* Pay After Confirmation\n  • *Amount Due:* ₹${finalTotal}`;
    if (payLink) paymentText += `\n  • *Secure Razorpay Link:* ${payLink}`;
  } else {
    paymentText = `💵 *Payment Method:* Cash on Confirmation (Pay ₹${finalTotal} by Cash/UPI/Cheque on delivery)`;
  }

  const message = `🌸 *BLOOM FLOWER SHOP - ORDER CONFIRMATION* 🌸

Hello *${order.customerName || 'Customer'}*,

Thank you for ordering with us! We have received your order details:

🆔 *Order ID:* #${order.id}
📅 *Delivery Date:* ${order.deliveryDate || ''} (${order.deliveryTimeSlot || ''})
📍 *Delivery Address:* ${order.deliveryAddress || ''}

🛒 *Ordered Items:*
${itemsList}${noteText}

💵 *Items Subtotal:* ₹${itemsSubtotal}
${deliveryText}
💰 *FINAL PAYABLE TOTAL:* ₹${finalTotal}
${paymentText}

We have checked your location and prepared your order details. Please reply to confirm this order!`;

  const encodedMsg = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`;
}

/**
 * Helper to generate Thank You message for paid orders
 */
export function generateThankYouWhatsAppLink(order) {
  if (!order || !order.customerPhone) return '#';
  let cleanPhone = String(order.customerPhone).replace(/\D/g, '').replace(/^0+/, '');
  if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

  const items = order.items || [];
  const itemsList = items
    .map(
      (item, idx) =>
        `  ${idx + 1}. *${item.nameEn || item.name || 'Item'}* x ${item.quantity || 1} ${item.unit || 'unit'}`
    )
    .join('\n');

  const totalAmt = order.total_amount || order.total || 0;

  const message = `🌸 *BLOOM FLOWER SHOP - THANK YOU FOR YOUR ORDER!* 🌸

Hello *${order.customerName || 'Valued Customer'}*,

Thank you so much for ordering with Bloom Flower Shop! 🌺

We have received your payment of *₹${totalAmt}* for Order *#${order.id}*.

📦 *Order Details:*
${itemsList}

📅 *Scheduled Delivery:* ${order.deliveryDate || ''} (${order.deliveryTimeSlot || ''})
📍 *Delivery Address:* ${order.deliveryAddress || ''}

Your fresh flowers are being handcrafted with care and will be delivered on time. Thank you for choosing Bloom! 🙏✨`;

  const encodedMsg = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`;
}

/**
 * Helper for customers to message the shop owner on WhatsApp regarding an order / complaint
 */
export function generateCustomerWhatsAppLink(order, shopPhone = '918310117145') {
  if (!order) return '#';

  let cleanPhone = String(shopPhone).replace(/\D/g, '').replace(/^0+/, '');
  if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

  const items = order.items || [];
  const itemsList = items
    .map((item, idx) => `  ${idx + 1}. *${item.nameEn || item.name || 'Item'}* x ${item.quantity || 1} ${item.unit || 'unit'}`)
    .join('\n');

  const payMethod = order.payment_method || order.paymentMethod || 'cod';
  const isPaid = order.payment_status === 'paid' || payMethod === 'online';
  const paymentText = isPaid
    ? '✅ FULLY PAID (Online via Razorpay)'
    : payMethod === 'half_advance'
    ? `⚠️ 50% ADVANCE PAID (₹${order.advance_amount || order.advanceAmount || 0}), REMAINING ₹${order.remaining_amount || order.remainingAmount || 0} DUE`
    : '⏳ UNPAID (Pay After Confirmation)';

  const totalAmt = order.total_amount !== undefined ? order.total_amount : (order.total || 0);

  const message = `🌸 *BLOOM FLOWER SHOP - ORDER HELP & COMPLAINT REQUEST* 🌸

Hello Bloom Admin,

I need help/support regarding my order:

🆔 *Order Number:* #${order.id}
👤 *Customer Name:* ${order.customer_name || order.customerName || 'Customer'}
📞 *Phone Number:* ${order.customer_phone || order.customerPhone || ''}
💳 *Payment Status:* ${paymentText}
💰 *Total Amount:* ₹${totalAmt}
📅 *Delivery Date:* ${order.delivery_date || order.deliveryDate || ''} (${order.delivery_time_slot || order.deliveryTimeSlot || ''})
📍 *Delivery Address:* ${order.delivery_address || order.deliveryAddress || ''}

🛒 *Ordered Items:*
${itemsList || '  • Standard Flower Items'}

Please assist me with my order. Thank you!`;

  const encodedMsg = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`;
}
