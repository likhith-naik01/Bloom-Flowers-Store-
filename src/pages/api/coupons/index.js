import { db } from '../../../backend/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const coupons = await db.getCoupons();
    return res.status(200).json(coupons);
  }

  if (req.method === 'POST') {
    const newCoupon = await db.addCoupon(req.body);
    return res.status(201).json(newCoupon);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
