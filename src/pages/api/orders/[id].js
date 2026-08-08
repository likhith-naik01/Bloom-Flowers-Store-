import { db } from '../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const order = await db.getOrderById(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    return res.status(200).json(order);
  }

  if (req.method === 'PUT') {
    try {
      const updated = await db.updateOrder(id, req.body || {});
      if (!updated) {
        return res.status(400).json({ error: 'Failed to update order details' });
      }
      return res.status(200).json(updated);
    } catch (e) {
      console.error('API Error updating order:', e);
      return res.status(500).json({ error: e.message || 'Failed to update order' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
