import { db } from '../../../backend/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    const updated = await db.updateCoupon(id, req.body);
    return res.status(200).json(updated);
  }

  if (req.method === 'DELETE') {
    await db.deleteCoupon(id);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
