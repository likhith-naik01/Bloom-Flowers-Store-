import { getRazorpayInstance } from '../../../payment/razorpay';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Invalid order amount' });
    }

    let amountInPaise = Number(amount);
    if (amountInPaise < 100) {
      amountInPaise = Math.round(amountInPaise * 100);
    }

    if (amountInPaise < 100) {
      return res.status(400).json({ error: 'Minimum order amount must be at least 100 paise (₹1)' });
    }

    const razorpay = getRazorpayInstance();

    const options = {
      amount: amountInPaise,
      currency: currency || 'INR',
      receipt: receipt || `order_rcpt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order_id: order.id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    if (error.statusCode === 401) {
      return res.status(401).json({ error: 'Razorpay Authentication failed. Check your API keys in .env.local.' });
    }
    return res.status(500).json({
      error: error.message || 'Failed to create Razorpay order'
    });
  }
}
