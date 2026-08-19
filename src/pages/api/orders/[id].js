import { db } from '../../../backend/db';
import { createClient } from '../../../backend/supabase/server';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const order = await db.getOrderById(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    return res.status(200).json(order);
  }

  if (req.method === 'PUT') {
    try {
      const updateData = req.body || {};
      const updated = await db.updateOrder(id, updateData);

      // If updating payment_status or status, synchronize with Supabase
      const supabase = createClient({ req, res });
      if (supabase && id) {
        const payload = {};
        if (updateData.status) payload.status = updateData.status;
        if (updateData.payment_status || updateData.paymentStatus) {
          payload.payment_status = updateData.payment_status || updateData.paymentStatus;
          if (payload.payment_status === 'paid') {
            payload.remaining_amount = 0;
          }
        }
        if (updateData.deliveryCharge !== undefined) payload.delivery_charge = Number(updateData.deliveryCharge);
        if (updateData.total !== undefined) payload.total_amount = Number(updateData.total);

        if (Object.keys(payload).length > 0) {
          payload.status_updated_at = new Date().toISOString();
          await supabase.from('orders').update(payload).eq('id', id);
        }

        // Insert log in order_status_history if payment status was updated to paid
        if (updateData.payment_status === 'paid' || updateData.paymentStatus === 'paid') {
          await supabase.from('order_status_history').insert({
            order_id: id,
            status: 'payment',
            note: 'Payment marked received & verified by Admin'
          });
        }
      }

      if (!updated) {
        return res.status(400).json({ error: 'Failed to update order details' });
      }
      return res.status(200).json(updated);
    } catch (e) {
      console.error('API Error updating order:', e);
      return res.status(500).json({ error: e.message || 'Failed to update order' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await db.deleteOrder(id);
      return res.status(200).json({ success: true, message: `Order #${id} deleted successfully` });
    } catch (e) {
      console.error('API Error deleting order:', e);
      return res.status(500).json({ error: e.message || 'Failed to delete order' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
