import { db } from '../../../backend/db';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb'
    },
    responseLimit: '10mb'
  }
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const products = await db.getRankedProducts();
    return res.status(200).json(products);
  }

  if (req.method === 'POST') {
    const newProd = await db.addProduct(req.body);
    if (newProd && newProd.error) {
      return res.status(500).json({ error: newProd.error });
    }
    return res.status(201).json(newProd);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
