import { db } from '../../../backend/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const isValid = await db.verifyAdmin(username, password);
  if (isValid) {
    return res.status(200).json({ success: true });
  }
  return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
}
