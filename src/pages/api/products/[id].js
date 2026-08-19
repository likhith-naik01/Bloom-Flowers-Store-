import { db } from '../../../backend/db';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb'
    }
  }
};

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const product = await db.getProductById(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.status(200).json(product);
  }

  if (req.method === 'PUT') {
    const updated = await db.updateProduct(id, req.body);
    return res.status(200).json(updated);
  }

  if (req.method === 'DELETE') {
    await db.deleteProduct(id);
    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
