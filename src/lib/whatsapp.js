/**
 * Helper to generate pre-filled WhatsApp deep-link for Admin to message customer
 * Supports location-based delivery charges and bulk order free delivery disclaimers.
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
💰 *FINAL PAYABLE TOTAL:* ₹${finalTotal} (Cash on Delivery)

We have checked your location and prepared your order details. Please reply to confirm this order!`;

  const encodedMsg = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`;
}

/**
 * Helper for customers to message the shop owner on WhatsApp regarding an order
 */
export function generateCustomerWhatsAppLink(order, shopPhone = '919876543210') {
  if (!order) return '#';

  let cleanPhone = String(shopPhone).replace(/\D/g, '').replace(/^0+/, '');
  if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

  const items = order.items || [];
  const itemsList = items
    .map((item, idx) => `  ${idx + 1}. *${item.nameEn || item.name || 'Item'}* x ${item.quantity || 1} ${item.unit || 'unit'}`)
    .join('\n');

  const message = `🌸 *BLOOM FLOWER SHOP - ORDER INQUIRY* 🌸

Hello Bloom Flower Shop,

I have placed an order on your store:

🆔 *Order ID:* #${order.id}
👤 *Name:* ${order.customerName || ''}
📞 *Phone:* ${order.customerPhone || ''}
📍 *Address:* ${order.deliveryAddress || ''}
📅 *Delivery Date:* ${order.deliveryDate || ''} (${order.deliveryTimeSlot || ''})

🛒 *Items:*
${itemsList}

💰 *Subtotal:* ₹${order.total || 0}

Please confirm my order. Thank you!`;

  const encodedMsg = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`;
}
