import { db } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const orders = await db.getOrders();
    return res.status(200).json(orders);
  }

  if (req.method === 'POST') {
    const { customerName, customerPhone, deliveryAddress, deliveryDate, deliveryTimeSlot, items, total, orderNote } = req.body;
    if (!customerName || !customerPhone || !deliveryAddress || !items || !items.length) {
      return res.status(400).json({ error: 'Missing required order fields' });
    }
    const newOrder = await db.createOrder({
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryDate: deliveryDate || new Date().toISOString().split('T')[0],
      deliveryTimeSlot: deliveryTimeSlot || 'Morning (9 AM - 12 PM)',
      orderNote: orderNote || '',
      items,
      total
    });
    return res.status(201).json(newOrder);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
