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
    const banners = await db.getBanners();
    return res.status(200).json(banners);
  }

  if (req.method === 'PUT') {
    const updatedBanners = await db.updateBanners(req.body);
    return res.status(200).json(updatedBanners);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
