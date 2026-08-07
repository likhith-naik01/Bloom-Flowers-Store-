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
    const categories = await db.getCategories();
    return res.status(200).json(categories);
  }

  if (req.method === 'POST') {
    const newCat = await db.addCategory(req.body);
    return res.status(201).json(newCat);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
