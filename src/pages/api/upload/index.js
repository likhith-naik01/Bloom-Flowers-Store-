import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb'
    }
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // If it's already an external HTTP/HTTPS URL, return it directly
    if (image.startsWith('http://') || image.startsWith('https://') || (image.startsWith('/') && !image.startsWith('data:'))) {
      return res.status(200).json({ url: image });
    }

    // Try saving file to local public/uploads directory
    try {
      const matches = image.match(/^data:image\/([a-zA-Z0-9-+.]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(200).json({ url: image });
      }

      const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filename = `img_${Date.now()}_${Math.floor(Math.random() * 10000)}.${ext}`;
      const filePath = path.join(uploadsDir, filename);

      fs.writeFileSync(filePath, buffer);
      return res.status(200).json({ url: `/uploads/${filename}` });
    } catch (fsErr) {
      console.warn('Filesystem write failed, using data URL fallback:', fsErr.message);
      // Fallback for Vercel/serverless environments where local filesystem is read-only
      return res.status(200).json({ url: image });
    }
  } catch (error) {
    console.error('Upload API error:', error);
    return res.status(500).json({ error: 'Failed to process image' });
  }
}
