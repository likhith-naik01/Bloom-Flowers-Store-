import { db } from '../../../backend/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, customerPhone, userId, cartTotal } = req.body;
    const result = await db.validateCoupon({ code, customerPhone, userId, cartTotal });

    if (!result.valid) {
      return res.status(400).json({ error: result.error });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error('Validate coupon error:', err);
    return res.status(500).json({ error: 'Internal server error while validating coupon.' });
  }
}
