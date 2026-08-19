const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data.json');
if (fs.existsSync(dataPath)) {
  const raw = fs.readFileSync(dataPath, 'utf-8');
  let data = JSON.parse(raw);

  const fallback = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80";

  function cleanString(str) {
    if (!str || typeof str !== 'string') return fallback;
    if (str.startsWith('data:') || str.length > 500) {
      return fallback;
    }
    return str;
  }

  if (Array.isArray(data.products)) {
    data.products = data.products.map(p => {
      let mainImg = cleanString(p.imageUrl || p.image_url || p.image);
      let imgs = Array.isArray(p.images) ? p.images.map(cleanString) : [mainImg];
      return {
        ...p,
        imageUrl: mainImg,
        image_url: mainImg,
        image: mainImg,
        images: imgs
      };
    });
  }

  if (Array.isArray(data.categories)) {
    data.categories = data.categories.map(c => {
      let img = cleanString(c.imageUrl || c.image_url || c.image);
      return {
        ...c,
        imageUrl: img,
        image_url: img,
        image: img
      };
    });
  }

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log('Cleaned base64 images from data.json! New size:', (fs.statSync(dataPath).size / 1024).toFixed(2), 'KB');
}
