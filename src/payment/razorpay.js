import Razorpay from 'razorpay';
import crypto from 'crypto';

export function getRazorpayInstance() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keyId === 'rzp_test_your_key_id') {
    throw new Error('Razorpay API keys are not configured in .env.local');
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export function verifyRazorpaySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  return generatedSignature === razorpay_signature;
}

export async function createPaymentLink({ amount, description, customer, orderId }) {
  const instance = getRazorpayInstance();
  const linkResponse = await instance.paymentLink.create({
    amount: Math.round(Number(amount) * 100),
    currency: 'INR',
    accept_partial: false,
    description: description || `Payment for Order #${orderId}`,
    customer: {
      name: customer?.name || 'Customer',
      contact: customer?.phone ? String(customer.phone).replace(/\D/g, '') : '',
      email: customer?.email || ''
    },
    notify: {
      sms: false,
      email: false
    },
    reminder_enable: true,
    notes: {
      order_id: orderId
    },
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/my-orders/${orderId}`,
    callback_method: 'get'
  });

  return linkResponse;
}

export function verifyWebhookSignature(rawBody, signature, secret) {
  if (!secret || !signature) return false;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  return expectedSignature === signature;
}
