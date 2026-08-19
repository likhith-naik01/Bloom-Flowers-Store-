import { db } from '../../../backend/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    const updated = await db.updateCategory(id, req.body);
    return res.status(200).json(updated);
  }

  if (req.method === 'DELETE') {
    await db.deleteCategory(id);
    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
