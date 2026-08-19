import Razorpay from 'razorpay';
import crypto from 'crypto';

export function getRazorpayInstance() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_live_TRex73mrRzbSqz';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'BblGzFjr6uqY5VuiqFakgsaE';

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export function verifyRazorpaySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'BblGzFjr6uqY5VuiqFakgsaE';
  if (!secret) return false;

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  return generatedSignature === razorpay_signature;
}

export async function createPaymentLink({ amount, description, customer, orderId }) {
  try {
    const razorpay = getRazorpayInstance();
    const amountInPaise = Math.round(Number(amount) * 100);

    const paymentLink = await razorpay.paymentLink.create({
      amount: amountInPaise,
      currency: 'INR',
      accept_partial: false,
      description: description || `Payment for Bloom Order #${orderId}`,
      customer: {
        name: customer?.name || 'Customer',
        phone: customer?.phone ? String(customer.phone) : undefined,
        email: customer?.email || undefined,
      },
      notify: {
        sms: true,
        whatsapp: true,
        email: false
      },
      reminder_enable: true,
      notes: {
        order_id: String(orderId)
      }
    });

    return paymentLink;
  } catch (error) {
    console.error('Error creating Razorpay Payment Link:', error);
    throw error;
  }
}
