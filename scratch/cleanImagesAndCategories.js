const fs = require('fs');
const path = require('path');

const categories = [
  {
    id: "cat_wedding",
    nameEn: "Wedding",
    nameHi: "Shadi Mala & Gajra",
    nameKn: "Maduve Haara",
    imageUrl: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=600&q=80",
    image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=600&q=80",
    description: "Grand Varmalas, Bridal Gajras, Groom garlands, Mandap flowers & Wedding Rose Petals."
  },
  {
    id: "cat_pooja_flowers",
    nameEn: "Pooja",
    nameHi: "Pooja Ke Phool",
    nameKn: "Pooje Huvu",
    imageUrl: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80",
    image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80",
    description: "Fresh daily Gulabi (Rose), Sevanthige (Chrysanthemum), Mallige (Jasmine), Lotus & Crossandra."
  },
  {
    id: "cat_festival",
    nameEn: "Festival",
    nameHi: "Tyohar Special",
    nameKn: "Habba Special",
    imageUrl: "https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=600&q=80",
    image: "https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=600&q=80",
    description: "Diwali Torans, Varalakshmi Flowers, Ganesh Chaturthi Durva & Navratri Garland Subscription."
  },
  {
    id: "cat_birthday",
    nameEn: "Birthday",
    nameHi: "Janamdin Guldasta",
    nameKn: "Huttu Habba Bouquet",
    imageUrl: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=600&q=80",
    image: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=600&q=80",
    description: "Vibrant flower hampers, mixed flower baskets, rose bouquets & celebration boxes."
  },
  {
    id: "cat_anniversary",
    nameEn: "Anniversary",
    nameHi: "Salgirah Special",
    nameKn: "Varshikotsava Special",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
    description: "Red rose surprise boxes, romantic lily hampers & luxury Dutch rose arrangements."
  },
  {
    id: "cat_garlands",
    nameEn: "Garlands",
    nameHi: "Phoolon Ki Mala",
    nameKn: "Huvina Haara",
    imageUrl: "https://images.unsplash.com/photo-1596073413225-300dd1d416c2?auto=format&fit=crop&w=600&q=80",
    image: "https://images.unsplash.com/photo-1596073413225-300dd1d416c2?auto=format&fit=crop&w=600&q=80",
    description: "Traditional deity garlands, temple haras, cardamom mala & rose-jasmine woven maalas."
  },
  {
    id: "cat_loose_flowers",
    nameEn: "Loose Flowers",
    nameHi: "Khule Phool & Pankhudi",
    nameKn: "Loose Huvu & Rekke",
    imageUrl: "https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?auto=format&fit=crop&w=600&q=80",
    image: "https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?auto=format&fit=crop&w=600&q=80",
    description: "Loose rose petals, mixed pooja petals, marigold loose flowers & jasmine buds by weight."
  },
  {
    id: "cat_pooja_leaves",
    nameEn: "Leaves",
    nameHi: "Pooja Ke Patte",
    nameKn: "Pooje Yele",
    imageUrl: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=600&q=80",
    image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=600&q=80",
    description: "Bilva Patra / Bel Patra, Tulasi sprigs, Mango Leaves for toran, Durva grass & Betel leaves."
  }
];

const fallbackImages = [
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1596073413225-300dd1d416c2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1548695607-9c73430ba065?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=800&q=80"
];

const dataPath = path.join(__dirname, '../data.json');
let data = {};
if (fs.existsSync(dataPath)) {
  data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
}

data.categories = categories;

if (Array.isArray(data.products)) {
  data.products = data.products.map((p, idx) => {
    let imgs = Array.isArray(p.images) ? p.images : (p.imageUrl ? [p.imageUrl] : []);
    imgs = imgs.map((img, imgIdx) => {
      if (!img || img.startsWith('C:') || img.startsWith('file:') || img.startsWith('data:')) {
        return fallbackImages[imgIdx % fallbackImages.length];
      }
      return img;
    });
    if (imgs.length === 0) imgs = [fallbackImages[idx % fallbackImages.length]];
    
    let mainImg = p.imageUrl;
    if (!mainImg || mainImg.startsWith('C:') || mainImg.startsWith('file:') || mainImg.startsWith('data:')) {
      mainImg = imgs[0];
    }

    return {
      ...p,
      imageUrl: mainImg,
      image_url: mainImg,
      images: imgs
    };
  });
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
console.log('Successfully updated data.json!');
