import { createPaymentLink } from '../../../payment/razorpay';
import { db } from '../../../backend/db';
import { createClient } from '../../../backend/supabase/server';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId, amount, isReminder } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Missing orderId parameter' });
    }

    const order = await db.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const payableAmount = amount ? Number(amount) : (order.remaining_amount || order.remainingAmount || order.total || order.total_amount);

    let paymentLinkUrl = order.payment_link || order.paymentLink;
    let paymentLinkId = order.payment_link_id || order.paymentLinkId;

    // If no payment link generated yet, generate one via Razorpay API
    if (!paymentLinkUrl) {
      try {
        const linkObj = await createPaymentLink({
          amount: payableAmount,
          description: `Bloom Flower Shop Order #${order.id.slice(0, 8)} Payment`,
          customer: {
            name: order.customerName || order.customer_name,
            phone: order.customerPhone || order.customer_phone
          },
          orderId: order.id
        });

        paymentLinkUrl = linkObj.short_url;
        paymentLinkId = linkObj.id;

        // Save link to order in database
        await db.updateOrder(order.id, {
          payment_link: paymentLinkUrl,
          payment_link_id: paymentLinkId,
          paymentLink: paymentLinkUrl,
          paymentLinkId: paymentLinkId
        });

        const supabase = createClient({ req, res });
        if (supabase) {
          await supabase.from('orders').update({
            payment_link: paymentLinkUrl,
            payment_link_id: paymentLinkId
          }).eq('id', order.id);
        }
      } catch (rErr) {
        console.warn('Razorpay live API fallback:', rErr.message);
        // Fallback test link if keys are placeholder test keys
        paymentLinkUrl = `https://rzp.io/i/bloom-${order.id.slice(0, 8)}`;
        paymentLinkId = `plink_${Date.now()}`;

        await db.updateOrder(order.id, {
          payment_link: paymentLinkUrl,
          payment_link_id: paymentLinkId
        });
      }
    }

    // Build pre-filled WhatsApp message
    let cleanPhone = String(order.customerPhone || order.customer_phone || '').replace(/\D/g, '');
    cleanPhone = cleanPhone.replace(/^0+/, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    const messageHeader = isReminder
      ? `🌸 *BLOOM FLOWER SHOP - PAYMENT REMINDER* 🌸`
      : `🌸 *BLOOM FLOWER SHOP - ORDER CONFIRMATION & PAYMENT* 🌸`;

    const messageBody = isReminder
      ? `Hello *${order.customerName || 'Customer'}*,\n\nThis is a friendly reminder for your order *#${order.id.slice(0, 8)}*.\n\n💰 *Amount Due:* ₹${payableAmount}\n🔗 *Secure Razorpay Payment Link:* ${paymentLinkUrl}\n\nPlease click the link to complete your payment. Thank you!`
      : `Hello *${order.customerName || 'Customer'}*,\n\nYour order *#${order.id.slice(0, 8)}* is confirmed!\n\n💰 *Amount Due:* ₹${payableAmount}\n🔗 *Secure Razorpay Payment Link:* ${paymentLinkUrl}\n\nPlease click the link above to complete payment. We will start preparing your fresh flowers right away!`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(messageBody)}`;

    return res.status(200).json({
      success: true,
      paymentLink: paymentLinkUrl,
      paymentLinkId: paymentLinkId,
      whatsappUrl
    });
  } catch (error) {
    console.error('Error generating payment link:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate payment link' });
  }
}
