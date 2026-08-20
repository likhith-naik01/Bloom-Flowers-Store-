import { db } from '../../backend/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const promoBanner = await db.getPromoBanner();
    return res.status(200).json(promoBanner);
  }

  if (req.method === 'POST') {
    const updatedPromoBanner = await db.updatePromoBanner(req.body || {});
    return res.status(200).json({ success: true, promoBanner: updatedPromoBanner });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

