import crypto from 'crypto';
import { createClient } from '../../backend/supabase/server';
import { db } from '../../backend/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
      payment_id,
      orderPayload,
      userId
    } = req.body;

    const rzpOrderId = razorpay_order_id || order_id;
    const rzpPaymentId = razorpay_payment_id || payment_id;

    if (!rzpOrderId || !rzpPaymentId || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing required payment verification fields' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'RAZORPAY_KEY_SECRET is not configured' });
    }

    // HMAC SHA256 Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${rzpOrderId}|${rzpPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('Razorpay signature mismatch! Verification failed.');
      return res.status(400).json({
        success: false,
        error: 'Signature verification failed. Payment not verified.'
      });
    }

    // If orderPayload is provided, save or update order status in database
    let createdOrderId = null;

    if (orderPayload) {
      const payMethod = orderPayload.payment_method || 'online';
      const payStatus = orderPayload.payment_status || (payMethod === 'half_advance' ? 'partially_paid' : 'paid');

      const supabase = createClient({ req, res });
      if (supabase) {
        const { data: orderData, error: orderErr } = await supabase
          .from('orders')
          .insert({
            user_id: userId || orderPayload.userId || null,
            customer_name: orderPayload.customerName,
            customer_phone: orderPayload.customerPhone,
            delivery_address: orderPayload.deliveryAddress,
            delivery_date: orderPayload.deliveryDate,
            delivery_time_slot: orderPayload.deliveryTimeSlot,
            notes: orderPayload.orderNote || '',
            items: orderPayload.items,
            total_amount: orderPayload.total,
            discount_amount: orderPayload.discountAmount || 0,
            coupon_code: orderPayload.couponCode || null,
            status: 'placed',
            payment_method: payMethod,
            payment_status: payStatus,
            advance_amount: orderPayload.advanceAmount || null,
            remaining_amount: orderPayload.remainingAmount || null,
            razorpay_order_id: rzpOrderId,
            razorpay_payment_id: rzpPaymentId,
            status_updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (!orderErr && orderData) {
          createdOrderId = orderData.id;

          await supabase.from('order_status_history').insert({
            order_id: createdOrderId,
            status: 'placed',
            note: payMethod === 'half_advance'
              ? `Half Advance Paid: ₹${orderPayload.advanceAmount} verified. Payment ID: ${rzpPaymentId}.`
              : `Online payment verified. Payment ID: ${rzpPaymentId}`
          });
        }
      }

      if (!createdOrderId) {
        const newOrder = await db.createOrder({
          customerName: orderPayload.customerName,
          customerPhone: orderPayload.customerPhone,
          deliveryAddress: orderPayload.deliveryAddress,
          deliveryDate: orderPayload.deliveryDate,
          deliveryTimeSlot: orderPayload.deliveryTimeSlot,
          orderNote: orderPayload.orderNote || '',
          items: orderPayload.items,
          total: orderPayload.total,
          discountAmount: orderPayload.discountAmount || 0,
          couponCode: orderPayload.couponCode || null,
          userId: userId || orderPayload.userId || null,
          status: 'placed',
          payment_method: payMethod,
          payment_status: payStatus,
          advanceAmount: orderPayload.advanceAmount || null,
          remainingAmount: orderPayload.remainingAmount || null,
          razorpay_order_id: rzpOrderId,
          razorpay_payment_id: rzpPaymentId
        });
        createdOrderId = newOrder.id;
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Payment signature verified successfully',
      id: createdOrderId
    });
  } catch (error) {
    console.error('Error verifying payment signature:', error);
    return res.status(500).json({
      error: error.message || 'Payment verification failed'
    });
  }
}
