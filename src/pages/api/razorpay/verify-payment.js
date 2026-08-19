import { verifyRazorpaySignature } from '../../../payment/razorpay';
import { createClient } from '../../../backend/supabase/server';
import { db } from '../../../backend/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderPayload, userId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderPayload) {
      return res.status(400).json({ error: 'Missing required payment verification parameters' });
    }

    // Server-side HMAC SHA256 Signature Verification
    const isValid = verifyRazorpaySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    if (!isValid) {
      console.error('Razorpay signature verification failed for order:', razorpay_order_id);
      return res.status(400).json({ error: 'Payment verification failed, invalid signature' });
    }

    const payMethod = orderPayload.payment_method || 'online';
    const payStatus = orderPayload.payment_status || (payMethod === 'half_advance' ? 'partially_paid' : 'paid');

    // Payment is authentic & verified server-side! Create order in DB.
    const supabase = createClient({ req, res });
    let createdOrderId = null;

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
          razorpay_order_id,
          razorpay_payment_id,
          status_updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (!orderErr && orderData) {
        createdOrderId = orderData.id;

        // Insert matching row in order_status_history
        await supabase.from('order_status_history').insert({
          order_id: createdOrderId,
          status: 'placed',
          note: payMethod === 'half_advance' 
            ? `Half Advance Paid: ₹${orderPayload.advanceAmount} verified. Payment ID: ${razorpay_payment_id}. Balance due on delivery: ₹${orderPayload.remainingAmount}`
            : `Online payment verified. Payment ID: ${razorpay_payment_id}`
        });
      }
    }

    // Fallback to local DB helper if Supabase insert didn't run
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
        razorpay_order_id,
        razorpay_payment_id
      });
      createdOrderId = newOrder.id;
    }

    // Record coupon usage
    if (orderPayload.couponCode || orderPayload.couponId) {
      const couponObj = orderPayload.couponId ? { id: orderPayload.couponId } : await db.getCouponByCode(orderPayload.couponCode);
      if (couponObj && couponObj.id) {
        await db.recordCouponUsage({
          couponId: couponObj.id,
          userId: userId || orderPayload.userId || null,
          customerPhone: orderPayload.customerPhone,
          orderId: createdOrderId
        });
      }
    }

    return res.status(200).json({
      success: true,
      id: createdOrderId
    });
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    return res.status(500).json({
      error: error.message || 'Payment verification failed, please try again or contact support'
    });
  }
}
