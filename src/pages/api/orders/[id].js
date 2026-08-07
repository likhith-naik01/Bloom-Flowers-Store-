import { db } from '../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const order = await db.getOrderById(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    return res.status(200).json(order);
  }

  if (req.method === 'PUT') {
    const updated = await db.updateOrder(id, req.body);
    return res.status(200).json(updated);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
