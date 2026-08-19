import { db } from '../../../backend/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const orders = await db.getOrders();
    return res.status(200).json(orders);
  }

  if (req.method === 'POST') {
    const {
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryDate,
      deliveryTimeSlot,
      items,
      total,
      orderNote,
      discountAmount,
      couponCode,
      couponId,
      userId,
      payment_method,
      payment_status,
      advanceAmount,
      remainingAmount
    } = req.body;

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
      total: Number(total || 0),
      discountAmount: Number(discountAmount || 0),
      couponCode: couponCode || null,
      userId: userId || null,
      payment_method: payment_method || 'cod',
      payment_status: payment_status || 'pending',
      advanceAmount: advanceAmount || null,
      remainingAmount: remainingAmount || null
    });

    if (newOrder && couponCode) {
      const couponObj = couponId ? { id: couponId } : await db.getCouponByCode(couponCode);
      if (couponObj && couponObj.id) {
        await db.recordCouponUsage({
          couponId: couponObj.id,
          userId: userId || null,
          customerPhone,
          orderId: newOrder.id
        });
      }
    }

    return res.status(201).json(newOrder);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
