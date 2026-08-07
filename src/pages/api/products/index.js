import { db } from '../../../lib/db';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb'
    }
  }
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const products = await db.getProducts();
    return res.status(200).json(products);
  }

  if (req.method === 'POST') {
    const newProd = await db.addProduct(req.body);
    return res.status(201).json(newProd);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
