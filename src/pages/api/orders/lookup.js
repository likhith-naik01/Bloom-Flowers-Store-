import { db } from '../../../backend/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone } = req.query;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number parameter required' });
  }

  const matchedOrders = await db.getOrdersByPhone(phone);
  return res.status(200).json(matchedOrders);
}
