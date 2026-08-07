export const INITIAL_CATEGORIES = [
  {
    id: "cat_anniversary",
    nameEn: "💕 Anniversary & Romance",
    nameHi: "Salgirah",
    nameKn: "Varshikotsava",
    imageUrl: "C:\\Users\\chait\\.gemini\\antigravity\\brain\\bd4199c6-e579-446a-bf03-7c398bed4f81\\red_roses_gulabi_1786136783051.jpg",
    description: "Red rose surprise boxes, romantic lily hampers & luxury arrangements."
  },
  {
    id: "cat_wedding",
    nameEn: "💍 Wedding & Varmala",
    nameHi: "Shadi Mala & Gajra",
    nameKn: "Maduve Haara & Gajra",
    imageUrl: "C:\\Users\\chait\\.gemini\\antigravity\\brain\\bd4199c6-e579-446a-bf03-7c398bed4f81\\garland_haras_1786136935550.jpg",
    description: "Grand Varmalas, Bridal Gajras (Mallige strings), Groom garlands & mandap flowers."
  },
  {
    id: "cat_birthday",
    nameEn: "🎂 Birthday & Celebration",
    nameHi: "Janamdin Guldasta",
    nameKn: "Huttu Habba Bouquet",
    imageUrl: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=600&q=80",
    description: "Festive flower hampers, mixed flower baskets, rose bouquets & gifts."
  },
  {
    id: "cat_bouquets",
    nameEn: "💐 Bouquets Section",
    nameHi: "Guldasta Category",
    nameKn: "Bouquet Section",
    imageUrl: "C:\\Users\\chait\\.gemini\\antigravity\\brain\\bd4199c6-e579-446a-bf03-7c398bed4f81\\red_roses_gulabi_1786136783051.jpg",
    description: "All types of bouquets: Rose bouquets, Lily bouquets, Mixed flower bouquets & Custom hampers."
  },
  {
    id: "cat_pooja_flowers",
    nameEn: "🌸 Loose Pooja Flowers",
    nameHi: "Pooja Ke Phool",
    nameKn: "Pooje Huvu",
    imageUrl: "C:\\Users\\chait\\.gemini\\antigravity\\brain\\bd4199c6-e579-446a-bf03-7c398bed4f81\\yellow_sevanthige_1786136800616.jpg",
    description: "Gulabi (Rose), Sevanthige (Chrysanthemum), Mallige (Jasmine), Chendu Hoovu (Marigold) & Kamala (Lotus)."
  },
  {
    id: "cat_pooja_leaves",
    nameEn: "🌿 Pooja Leaves",
    nameHi: "Pooja Patte",
    nameKn: "Pooje Yele",
    imageUrl: "C:\\Users\\chait\\.gemini\\antigravity\\brain\\bd4199c6-e579-446a-bf03-7c398bed4f81\\bel_patra_plain_1786137069495.jpg",
    description: "Tulasi sprigs, Bilva Patra / Bel Patra (21 & 108 sprigs) & Durva / Garike grass."
  },
  {
    id: "cat_garlands",
    nameEn: "🌺 Garlands & Maalas",
    nameHi: "Phoolon Ki Mala",
    nameKn: "Huvina Haara",
    imageUrl: "C:\\Users\\chait\\.gemini\\antigravity\\brain\\bd4199c6-e579-446a-bf03-7c398bed4f81\\garland_haras_1786136935550.jpg",
    description: "Traditional deity garlands, mixed flower maalas, and custom length garlands."
  },
  {
    id: "cat_pooja_samagri",
    nameEn: "🪔 Pooja Samagri",
    nameHi: "Pooja Samagri",
    nameKn: "Pooje Saamagree",
    imageUrl: "C:\\Users\\chait\\.gemini\\antigravity\\brain\\bd4199c6-e579-446a-bf03-7c398bed4f81\\ganesh_pooja_kit_1786136981367.jpg",
    description: "Agarbathi, Dhoop, Camphor, Kumkum, Turmeric, Chandan, Wicks & Lamp Oil."
  },
  {
    id: "cat_pooja_kits",
    nameEn: "🎁 Complete Pooja Kits",
    nameHi: "Pooja Kit",
    nameKn: "Pooje Pack",
    imageUrl: "C:\\Users\\chait\\.gemini\\antigravity\\brain\\bd4199c6-e579-446a-bf03-7c398bed4f81\\ganesh_pooja_kit_1786136981367.jpg",
    description: "All-in-one Ganesh Pooja Kit, Varalakshmi Kit & Shivaratri Kits."
  }
];

export const INITIAL_PRODUCTS = [
  // 1. Gulabi (Rose)
  {
    id: "prod_rose_red",
    categoryIds: ["cat_pooja_flowers", "cat_anniversary"],
    nameEn: "Gulabi (Red Roses)",
    nameHi: "Gulabi",
    nameKn: "Gulabi",
    price: 90,
    unit: "bunch",
    unitVariants: [
      { unit: "100g Loose", price: 60 },
      { unit: "250g Loose", price: 140 },
      { unit: "1 Bunch (12 stems)", price: 250 },
      { unit: "1 kg Loose", price: 450 }
    ],
    discountType: "percent",
    discountValue: 10,
    inStock: true,
    images: [
      "C:\\Users\\chait\\.gemini\\antigravity\\brain\\bd4199c6-e579-446a-bf03-7c398bed4f81\\red_roses_gulabi_1786136783051.jpg",
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1548695607-9c73430ba065?auto=format&fit=crop&w=600&q=80"
    ],
    description: "Photo 1: Fresh Rose Setup. Photo 2: Plain Background Isolated Rose. Photo 3: Pack Stems.",
    tags: ["Pooja Flowers", "Rose"]
  },

  // 2. Sevanthige (Chrysanthemum)
  {
    id: "prod_sevanthige",
    categoryIds: ["cat_pooja_flowers"],
    nameEn: "Sevanthige (Yellow Chrysanthemum)",
    nameHi: "Sevanthige",
    nameKn: "Sevanthige",
    price: 180,
    unit: "kg",
    unitVariants: [
      { unit: "250g", price: 50 },
      { unit: "500g", price: 95 },
      { unit: "1 kg", price: 180 },
      { unit: "2 kg", price: 340 }
    ],
    discountType: "flat",
    discountValue: 20,
    inStock: true,
    images: [
      "C:\\Users\\chait\\.gemini\\antigravity\\brain\\bd4199c6-e579-446a-bf03-7c398bed4f81\\yellow_sevanthige_1786136800616.jpg",
      "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80"
    ],
    description: "Photo 1: Worship Basket. Photo 2: Plain Isolated Yellow Blooms. Photo 3: Weighed Pack.",
    tags: ["Pooja Flowers", "Sevanthige"]
  },

  // 3. Jasmine (Mallige)
  {
    id: "prod_malle",
    categoryIds: ["cat_pooja_flowers", "cat_garlands"],
    nameEn: "Mallige / Malle (Fragrant Jasmine Buds)",
    nameHi: "Chameli / Jasmine",
    nameKn: "Mallige Huvu",
    price: 240,
    unit: "gram",
    unitVariants: [
      { unit: "100g", price: 100 },
      { unit: "250g", price: 240 },
      { unit: "500g", price: 450 },
      { unit: "1 kg", price: 850 }
    ],
    discountType: "percent",
    discountValue: 15,
    inStock: true,
    images: [
      "C:\\Users\\chait\\.gemini\\antigravity\\brain\\bd4199c6-e579-446a-bf03-7c398bed4f81\\jasmine_mallige_1786136820568.jpg",
      "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1596073413225-300dd1d416c2?auto=format&fit=crop&w=600&q=80"
    ],
    description: "Photo 1: Banana Leaf Setup. Photo 2: Plain Isolated String. Photo 3: Loose Buds Pack.",
    tags: ["Pooja Flowers", "Jasmine"]
  },

  // 4. Marigold (Chendu Hoovu)
  {
    id: "prod_marigold",
    categoryIds: ["cat_pooja_flowers"],
    nameEn: "Chendu Hoovu / Marigold",
    nameHi: "Genda Phool",
    nameKn: "Chendu Huvu",
    price: 120,
    unit: "kg",
    unitVariants: [
      { unit: "500g", price: 65 },
      { unit: "1 kg", price: 120 },
      { unit: "3 kg Bulk", price: 330 }
    ],
    discountType: "none",
    discountValue: 0,
    inStock: true,
    images: [
      "C:\\Users\\chait\\.gemini\\antigravity\\brain\\bd4199c6-e579-446a-bf03-7c398bed4f81\\marigold_chendu_1786136840881.jpg",
      "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80"
    ],
    description: "Photo 1: Temple Thali. Photo 2: Plain Isolated Marigold. Photo 3: Weighed Bag.",
    tags: ["Pooja Flowers", "Marigold"]
  },

  // 5. Lotus (Kamala)
  {
    id: "prod_lotus",
    categoryIds: ["cat_pooja_flowers"],
    nameEn: "Kamala (Sacred Lotus Flowers)",
    nameHi: "Kamal Ka Phool",
    nameKn: "Kamala Huvu",
    price: 150,
    unit: "piece",
    unitVariants: [
      { unit: "Pair (2 Lotus stems)", price: 150 },
      { unit: "Pack of 5 Lotus", price: 350 }
    ],
    discountType: "none",
    discountValue: 0,
    inStock: true,
    images: [
      "C:\\Users\\chait\\.gemini\\antigravity\\brain\\bd4199c6-e579-446a-bf03-7c398bed4f81\\lotus_kamala_1786136863531.jpg",
      "https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80"
    ],
    description: "Photo 1: Altar Setup. Photo 2: Plain Isolated Lotus Stems. Photo 3: Lotus Pair Pack.",
    tags: ["Pooja Flowers", "Lotus"]
  },

  // Bouquets Section
  {
    id: "prod_rose_bouquet",
    categoryIds: ["cat_bouquets", "cat_anniversary", "cat_birthday"],
    nameEn: "Classic Red Rose Bouquet",
    nameHi: "Gulab Guldasta",
    nameKn: "Gulabi Bouquet",
    price: 299,
    unit: "bunch",
    unitVariants: [
      { unit: "12 Red Roses Bunch", price: 299 },
      { unit: "24 Red Roses Bunch", price: 549 },
      { unit: "50 Premium Red Roses Box", price: 999 }
    ],
    discountType: "percent",
    discountValue: 10,
    inStock: true,
    images: [
      "C:\\Users\\chait\\.gemini\\antigravity\\brain\\bd4199c6-e579-446a-bf03-7c398bed4f81\\red_roses_gulabi_1786136783051.jpg",
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1548695607-9c73430ba065?auto=format&fit=crop&w=600&q=80"
    ],
    description: "Photo 1: Rose Arrangement. Photo 2: Plain Isolated Bouquet. Photo 3: Stem Detail.",
    tags: ["Bouquet", "Anniversary"]
  },
  {
    id: "prod_lily_bouquet",
    categoryIds: ["cat_bouquets", "cat_birthday"],
    nameEn: "Royal Pink Lily & Rose Bouquet",
    nameHi: "Lily Guldasta",
    nameKn: "Lily Bouquet",
    price: 499,
    unit: "bunch",
    unitVariants: [
      { unit: "Standard 6 Stems Lily Bunch", price: 499 },
      { unit: "Luxury 12 Stems Lily & Rose Hamper", price: 899 }
    ],
    discountType: "none",
    discountValue: 0,
    inStock: true,
    images: [
      "https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=600&q=80"
    ],
    description: "Photo 1: Luxury Lily Setup. Photo 2: Plain Isolated Bouquet. Photo 3: Stem Close-up.",
    tags: ["Bouquet", "Birthday"]
  },

  // Wedding Varmala
  {
    id: "prod_wedding_varmala",
    categoryIds: ["cat_wedding", "cat_garlands"],
    nameEn: "Grand Rose & Jasmine Varmala Pair",
    nameHi: "Shadi Rose Jasmine Varmala",
    nameKn: "Maduve Rose Mallige Varmala",
    price: 1200,
    unit: "piece",
    unitVariants: [
      { unit: "Pair of 3.5 ft Varmalas", price: 1200 },
      { unit: "Pair of 4.5 ft Heavy Varmalas", price: 1800 }
    ],
    discountType: "none",
    discountValue: 0,
    inStock: true,
    images: [
      "C:\\Users\\chait\\.gemini\\antigravity\\brain\\bd4199c6-e579-446a-bf03-7c398bed4f81\\garland_haras_1786136935550.jpg",
      "https://images.unsplash.com/photo-1596073413225-300dd1d416c2?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=600&q=80"
    ],
    description: "Photo 1: Varmala Wear. Photo 2: Plain Flat Lay Garland. Photo 3: Flower Weave.",
    tags: ["Wedding", "Varmala"]
  },

  // Leaves
  {
    id: "prod_bilva",
    categoryIds: ["cat_pooja_leaves"],
    nameEn: "Bilva Patra / Bel Patra (21 & 108 Sprigs)",
    nameHi: "Bel Patra",
    nameKn: "Bilwa Patre",
    price: 60,
    unit: "bunch",
    unitVariants: [
      { unit: "21 Sprigs Pack", price: 60 },
      { unit: "108 Sacred Sprigs Pack", price: 220 }
    ],
    discountType: "none",
    discountValue: 0,
    inStock: true,
    images: [
      "C:\\Users\\chait\\.gemini\\antigravity\\brain\\bd4199c6-e579-446a-bf03-7c398bed4f81\\bel_patra_1786136910785.jpg",
      "C:\\Users\\chait\\.gemini\\antigravity\\brain\\bd4199c6-e579-446a-bf03-7c398bed4f81\\bel_patra_plain_1786137069495.jpg",
      "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=600&q=80"
    ],
    description: "Photo 1: Sacred Worship Setup. Photo 2: Plain Background Isolated Bel Patra Sprig (Exact Delivered Item). Photo 3: Pack Quantity.",
    tags: ["Pooja Leaves"]
  },
  {
    id: "prod_tulsi",
    categoryIds: ["cat_pooja_leaves"],
    nameEn: "Tulasi Leaves & Manjari Pack",
    nameHi: "Tulsi Patte",
    nameKn: "Tulasi Yele",
    price: 40,
    unit: "bunch",
    unitVariants: [
      { unit: "1 Small Bunch", price: 40 },
      { unit: "Large Pooja Pack", price: 90 }
    ],
    discountType: "none",
    discountValue: 0,
    inStock: true,
    images: [
      "C:\\Users\\chait\\.gemini\\antigravity\\brain\\bd4199c6-e579-446a-bf03-7c398bed4f81\\tulsi_leaves_1786136889205.jpg",
      "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80"
    ],
    description: "Photo 1: Fresh Sprig Close-up. Photo 2: Plain Isolated Leaves. Photo 3: Wrapped Bunch.",
    tags: ["Pooja Leaves"]
  },

  // Complete Pooja Kits
  {
    id: "prod_ganesh_kit",
    categoryIds: ["cat_pooja_kits"],
    nameEn: "Ganesh Pooja Complete Kit",
    nameHi: "Ganesh Pooja Samagri Kit",
    nameKn: "Ganesha Pooje Kit",
    price: 399,
    unit: "piece",
    unitVariants: [
      { unit: "Standard Kit", price: 399 },
      { unit: "Grand Festival Kit with Fruits", price: 699 }
    ],
    discountType: "percent",
    discountValue: 15,
    inStock: true,
    images: [
      "C:\\Users\\chait\\.gemini\\antigravity\\brain\\bd4199c6-e579-446a-bf03-7c398bed4f81\\ganesh_pooja_kit_1786136981367.jpg",
      "https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80"
    ],
    description: "Photo 1: Altar Setup. Photo 2: Plain Isolated Kit Items. Photo 3: Boxed Packaging.",
    tags: ["Pooja Kit"]
  }
];

export const INITIAL_BANNERS = [
  {
    id: "b_1",
    title: "Fresh Morning Pooja Flowers & Garlands",
    subtitle: "Rose, Sevanthige, Jasmine, Bel Patra & Complete Pooja Kits",
    imageUrl: "C:\\Users\\chait\\.gemini\\antigravity\\brain\\bd4199c6-e579-446a-bf03-7c398bed4f81\\ganesh_pooja_kit_1786136981367.jpg",
    badge: "POOJA SPECIAL"
  }
];

export const INITIAL_ORDERS = [
  {
    id: "FLW-9812",
    customerName: "Ramesh Kumar",
    customerPhone: "9876543210",
    deliveryAddress: "#45, 2nd Main, Indiranagar, Bengaluru",
    deliveryDate: "2026-08-08",
    deliveryTimeSlot: "Morning (9 AM - 12 PM)",
    orderNote: "Please send fresh Sevanthige flowers and 108 Bel Patra for morning pooja.",
    items: [
      { id: "prod_sevanthige", nameEn: "Sevanthige (Yellow Chrysanthemum)", selectedUnit: "1 kg", quantity: 2, price: 160, unit: "kg" },
      { id: "prod_bilva", nameEn: "Bilva Patra / Bel Patra", selectedUnit: "108 Sacred Sprigs Pack", quantity: 1, price: 220, unit: "bunch" }
    ],
    total: 540,
    status: "new",
    paymentStatus: "cod",
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];
