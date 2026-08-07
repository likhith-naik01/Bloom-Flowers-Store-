/**
 * Helper to generate pre-filled WhatsApp deep-link for Admin to message customer
 * Supports location-based delivery charges and bulk order free delivery disclaimers.
 */
export function generateAdminWhatsAppLink(order, customDeliveryCharge, isBulkOrder) {
  if (!order || !order.customerPhone) return '#';

  // Sanitize phone number (strip spaces/dashes, ensure international format e.g. 91 prefix if 10 digits)
  let cleanPhone = order.customerPhone.replace(/\D/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone; // Default to India (+91) if 10 digits
  }

  const itemsSubtotal = order.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const itemsList = order.items
    .map((item, idx) => `  ${idx + 1}. *${item.nameEn}* x ${item.quantity} ${item.unit} = ₹${item.price * item.quantity}`)
    .join('\n');

  const noteText = order.orderNote ? `\n\n📝 *Customer Note:* "${order.orderNote}"` : '';

  // Determine bulk order & delivery charge
  const bulk = isBulkOrder !== undefined ? isBulkOrder : !!order.isBulkOrder;
  const deliveryFee = bulk ? 0 : (customDeliveryCharge !== undefined ? Number(customDeliveryCharge) : (order.deliveryCharge || 0));
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

Hello *${order.customerName}*,

Thank you for ordering with us! We have received your order details:

🆔 *Order ID:* #${order.id}
📅 *Delivery Date:* ${order.deliveryDate} (${order.deliveryTimeSlot})
📍 *Delivery Address:* ${order.deliveryAddress}

🛒 *Ordered Items:*
${itemsList}${noteText}

💵 *Items Subtotal:* ₹${itemsSubtotal}
${deliveryText}
💰 *FINAL PAYABLE TOTAL:* ₹${finalTotal} (Cash on Delivery)

We have checked your location and prepared your order details. Please reply to confirm this order!`;

  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
}
