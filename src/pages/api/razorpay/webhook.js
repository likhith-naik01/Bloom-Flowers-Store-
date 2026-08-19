import { verifyWebhookSignature } from '../../../payment/razorpay';
import { db } from '../../../backend/db';
import { createClient } from '../../../backend/supabase/server';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const buf = await buffer(req);
    const rawBody = buf.toString('utf8');
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        console.error('Invalid Razorpay webhook signature!');
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    console.log('Received Razorpay Webhook Event:', event);

    let orderId = null;
    let paymentId = null;

    if (event === 'payment_link.paid') {
      const plink = payload.payload.payment_link.entity;
      orderId = plink.notes?.order_id;
      paymentId = payload.payload.payment?.entity?.id || plink.id;
    } else if (event === 'payment.captured' || event === 'order.paid') {
      const pentity = payload.payload.payment.entity;
      orderId = pentity.notes?.order_id;
      paymentId = pentity.id;
    }

    if (orderId) {
      console.log(`Updating payment status to PAID for order ${orderId}`);

      // 1. Update in local DB
      await db.updateOrder(orderId, {
        payment_status: 'paid',
        paymentStatus: 'paid',
        remaining_amount: 0,
        remainingAmount: 0,
        razorpay_payment_id: paymentId
      });

      // 2. Update in Supabase
      const supabase = createClient({ req, res });
      if (supabase) {
        await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            remaining_amount: 0,
            razorpay_payment_id: paymentId,
            status_updated_at: new Date().toISOString()
          })
          .eq('id', orderId);

        await supabase.from('order_status_history').insert({
          order_id: orderId,
          status: 'confirmed',
          note: `Payment verified via Razorpay Webhook (${event}). Payment ID: ${paymentId || 'N/A'}`
        });
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing Razorpay webhook:', error);
    return res.status(500).json({ error: error.message || 'Webhook processing failed' });
  }
}
