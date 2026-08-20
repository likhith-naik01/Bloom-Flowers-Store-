import fs from 'fs';
import path from 'path';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_BANNERS, INITIAL_ORDERS } from './sampleData.js';
import { supabase } from './supabase.js';

const DB_PATH = path.join(process.cwd(), 'data.json');
const TMP_PATH = path.join(process.cwd(), 'data.json.tmp');

const DEFAULT_PROMO_BANNER = {
  enabled: true,
  badgeText: 'LIMITED FESTIVAL DEAL',
  couponCode: 'BLOOM10',
  title: 'Get Flat 10% OFF + Free Morning Delivery on Fresh Flowers & Garlands!',
  subtitle: 'Handpicked fresh blooms delivered directly from local flower markets to your doorstep before sunrise.',
  buttonText: 'Claim 10% Offer Now'
};

const INITIAL_COUPONS = [];

let memoryCache = null;
let lastMtime = 0;

function readDb() {
  if (global.__MEMORY_CACHE__) {
    return global.__MEMORY_CACHE__;
  }
  try {
    if (!fs.existsSync(DB_PATH)) {
      const initialData = {
        categories: INITIAL_CATEGORIES,
        products: INITIAL_PRODUCTS,
        banners: INITIAL_BANNERS,
        orders: INITIAL_ORDERS,
        coupons: INITIAL_COUPONS,
        promoBanner: DEFAULT_PROMO_BANNER,
        admins: [
          { username: 'admin_1', password: 'Ratik@2892' },
          { username: 'Likhith', password: 'Likhith@0501' }
        ]
      };
      memoryCache = initialData;
      global.__MEMORY_CACHE__ = initialData;
      try { fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8'); } catch(e){}
      return initialData;
    }

    const stat = fs.statSync(DB_PATH);
    if (memoryCache && stat.mtimeMs === lastMtime) {
      return memoryCache;
    }

    const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
    memoryCache = JSON.parse(fileContent);
    if (!Array.isArray(memoryCache.coupons)) {
      memoryCache.coupons = [];
    }
    if (!memoryCache.promoBanner) memoryCache.promoBanner = DEFAULT_PROMO_BANNER;
    global.__MEMORY_CACHE__ = memoryCache;
    lastMtime = stat.mtimeMs;
    return memoryCache;
  } catch (error) {
    console.error('Error reading DB file:', error);
    if (memoryCache) return memoryCache;
    const initialData = {
      categories: INITIAL_CATEGORIES,
      products: INITIAL_PRODUCTS,
      banners: INITIAL_BANNERS,
      orders: INITIAL_ORDERS,
      admins: [
        { username: 'admin_1', password: 'Ratik@2892' },
        { username: 'Likhith', password: 'Likhith@0501' }
      ]
    };
    memoryCache = initialData;
    global.__MEMORY_CACHE__ = initialData;
    return initialData;
  }
}

function writeDb(data) {
  memoryCache = data;
  global.__MEMORY_CACHE__ = data;
  try {
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(TMP_PATH, jsonString, 'utf-8');
    fs.renameSync(TMP_PATH, DB_PATH);
    lastMtime = fs.statSync(DB_PATH).mtimeMs;
  } catch (error) {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
      lastMtime = fs.statSync(DB_PATH).mtimeMs;
    } catch (e) {}
  }
}

export const db = {
  // Categories
  getCategories: async () => {
    if (supabase) {
      const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map(c => ({
          ...c,
          nameEn: c.name || c.nameEn || '',
          imageUrl: c.image || c.imageUrl || '',
          image: c.image || c.imageUrl || ''
        }));
      }

      // Seed initial dummy categories into Supabase if empty
      if (!error && data && data.length === 0) {
        try {
          const insertPayload = INITIAL_CATEGORIES.map(c => ({
            id: c.id,
            name: c.nameEn || c.name,
            slug: (c.nameEn || c.name).toLowerCase().replace(/\s+/g, '-'),
            image: c.image || c.imageUrl || '',
            description: c.description || ''
          }));
          await supabase.from('categories').insert(insertPayload);
          const { data: fresh } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
          if (fresh && fresh.length > 0) {
            return fresh.map(c => ({
              ...c,
              nameEn: c.name || '',
              imageUrl: c.image || '',
              image: c.image || ''
            }));
          }
        } catch (e) {
          console.error('Category seeding error:', e);
        }
      }
    }
    const cats = readDb().categories || [];
    return cats.map(c => ({
      ...c,
      nameEn: c.nameEn || c.name || '',
      imageUrl: c.imageUrl || c.image || '',
      image: c.image || c.imageUrl || ''
    }));
  },
  addCategory: async (cat) => {
    const catName = cat.nameEn || cat.name || 'New Category';
    const catImg = cat.image || cat.imageUrl || '';
    const newCat = {
      ...cat,
      id: cat.id || `cat_${Date.now()}`,
      name: catName,
      nameEn: catName,
      image: catImg,
      imageUrl: catImg
    };

    if (supabase) {
      try {
        const { data, error } = await supabase.from('categories').insert([{
          id: newCat.id,
          name: catName,
          slug: cat.slug || catName.toLowerCase().replace(/\s+/g, '-'),
          image: catImg,
          description: cat.description || ''
        }]).select().single();
        if (error) console.error('Supabase addCategory error:', error);
        if (!error && data) {
          return {
            ...data,
            nameEn: data.name || catName,
            imageUrl: data.image || catImg,
            image: data.image || catImg
          };
        }
      } catch (err) {
        console.error('Supabase addCategory exception:', err);
      }
    }

    try {
      const local = readDb();
      local.categories = local.categories || [];
      local.categories.push(newCat);
      writeDb(local);
    } catch (e) {
      console.warn('writeDb skipped:', e);
    }
    return newCat;
  },
  updateCategory: async (id, updated) => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('categories').update({
          name: updated.nameEn || updated.name,
          image: updated.image || updated.imageUrl,
          description: updated.description
        }).eq('id', id).select().single();
        if (!error && data) {
          return {
            ...data,
            nameEn: data.name,
            imageUrl: data.image
          };
        }
      } catch (e) {
        console.error('Supabase updateCategory error:', e);
      }
    }
    const local = readDb();
    local.categories = (local.categories || []).map(c => c.id === id ? { ...c, ...updated } : c);
    try { writeDb(local); } catch (e) {}
    return local.categories.find(c => c.id === id);
  },
  deleteCategory: async (id) => {
    if (supabase) {
      try {
        await supabase.from('categories').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase deleteCategory error:', e);
      }
    }
    const local = readDb();
    local.categories = (local.categories || []).filter(c => c.id !== id);
    try { writeDb(local); } catch (e) {}
  },

  getProducts: async () => {
    let supabaseProducts = [];

    if (supabase) {
      try {
        let res = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (res.error) {
          res = await supabase.from('products').select('*');
        }
        if (!res.error && res.data) {
          supabaseProducts = res.data.map((p, idx) => ({
            ...p,
            slNo: Number(p.sl_no || p.slNo || (idx + 1)),
            nameEn: p.name || p.nameEn || '',
            nameHi: p.nameHi || '',
            nameKn: p.nameKn || '',
            unit: p.unit || (Array.isArray(p.unit_variants || p.unitVariants) && (p.unit_variants || p.unitVariants)[0]?.unit) || 'piece',
            imageUrl: p.image_url || (Array.isArray(p.images) && p.images[0] ? p.images[0] : ''),
            images: Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.image_url ? [p.image_url] : []),
            categoryIds: p.category_ids || [],
            unitVariants: p.unit_variants || [],
            discountType: p.discount_type || p.discountType || (Number(p.discount_value || 0) > 0 ? 'percent' : 'none'),
            discountValue: Number(p.discount_value || 0),
            inStock: p.in_stock !== false,
            isSeasonal: Boolean(p.is_seasonal || p.isSeasonal),
            seasonalTag: p.seasonal_tag || p.seasonalTag || ''
          }));
        }
      } catch (e) {
        console.error('Supabase getProducts error:', e);
      }
    }

    const prods = readDb().products || [];
    const localProducts = prods.map((p, idx) => ({
      ...p,
      slNo: Number(p.sl_no || p.slNo || (idx + 1)),
      nameEn: p.nameEn || p.name || '',
      unit: p.unit || (Array.isArray(p.unitVariants) && p.unitVariants[0]?.unit) || 'piece',
      categoryIds: Array.isArray(p.categoryIds) ? p.categoryIds : (p.categoryId ? [p.categoryId] : []),
      images: Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.imageUrl ? [p.imageUrl] : []),
      imageUrl: p.imageUrl || (Array.isArray(p.images) && p.images[0] ? p.images[0] : ''),
      unitVariants: Array.isArray(p.unitVariants) ? p.unitVariants : [],
      discountType: p.discountType || 'none',
      isSeasonal: Boolean(p.isSeasonal || p.is_seasonal),
      seasonalTag: p.seasonalTag || p.seasonal_tag || ''
    }));

    if (supabaseProducts.length >= localProducts.length && supabaseProducts.length > 0) {
      return supabaseProducts;
    }
    return localProducts;
  },

  // Dynamic Bestseller + Seasonal Product Ranking System
  getRankedProducts: async (topBestsellersCount = 5) => {
    const rawProducts = await db.getProducts();

    // 1. Calculate sales count per product across all non-cancelled orders
    const salesMap = {};
    try {
      const orders = await db.getOrders();
      (orders || []).forEach(o => {
        if (o.status && o.status.toLowerCase() === 'cancelled') return;
        const items = Array.isArray(o.items) ? o.items : [];
        items.forEach(it => {
          const pId = String(it.product_id || it.productId || it.id || '');
          if (!pId) return;
          const qty = Number(it.quantity || 1);
          salesMap[pId] = (salesMap[pId] || 0) + qty;
        });
      });
    } catch (e) {
      console.warn('Error calculating bestseller counts from orders:', e);
    }

    // 2. Attach bestseller_count to each product
    const productsWithStats = rawProducts.map(p => {
      const pIdStr = String(p.id);
      const soldCount = salesMap[pIdStr] || 0;
      return {
        ...p,
        bestsellerCount: soldCount
      };
    });

    // 3. Determine Top N Bestsellers
    const sortedBySales = [...productsWithStats]
      .filter(p => p.bestsellerCount > 0)
      .sort((a, b) => b.bestsellerCount - a.bestsellerCount);

    const bestsellerIds = new Set(sortedBySales.slice(0, topBestsellersCount).map(p => String(p.id)));

    const taggedProducts = productsWithStats.map(p => {
      const pIdStr = String(p.id);
      const isBestseller = bestsellerIds.has(pIdStr);
      const rankIndex = isBestseller ? sortedBySales.findIndex(x => String(x.id) === pIdStr) + 1 : 0;
      return {
        ...p,
        isBestseller,
        bestsellerRank: rankIndex
      };
    });

    // 4. Sort: Seasonal Items First -> Bestsellers Next -> Remaining Items
    return taggedProducts.sort((a, b) => {
      // 1st priority: Seasonal items first
      if (a.isSeasonal !== b.isSeasonal) {
        return a.isSeasonal ? -1 : 1;
      }
      // 2nd priority: Bestsellers next
      if (a.isBestseller !== b.isBestseller) {
        return a.isBestseller ? -1 : 1;
      }
      // 3rd priority: Higher sales count among bestsellers
      if (a.isBestseller && b.isBestseller) {
        return b.bestsellerCount - a.bestsellerCount;
      }
      // 4th priority: Default slNo order
      return Number(a.slNo || 0) - Number(b.slNo || 0);
    });
  },

  getProductById: async (id) => {
    if (supabase) {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (!error && data) {
        return {
          ...data,
          slNo: Number(data.sl_no || data.slNo || 1),
          nameEn: data.name || data.nameEn || '',
          unit: data.unit || (Array.isArray(data.unit_variants) && data.unit_variants[0]?.unit) || 'piece',
          imageUrl: data.image_url || (Array.isArray(data.images) && data.images[0] ? data.images[0] : ''),
          images: Array.isArray(data.images) && data.images.length > 0 ? data.images : (data.image_url ? [data.image_url] : []),
          categoryIds: data.category_ids || [],
          unitVariants: data.unit_variants || [],
          discountType: data.discount_type || data.discountType || (Number(data.discount_value || 0) > 0 ? 'percent' : 'none'),
          discountValue: Number(data.discount_value || 0),
          inStock: data.in_stock !== false,
          isSeasonal: Boolean(data.is_seasonal || data.isSeasonal),
          seasonalTag: data.seasonal_tag || data.seasonalTag || ''
        };
      }
    }
    const products = await db.getProducts();
    return products.find(p => p.id === id);
  },
  addProduct: async (prod) => {
    const imagesList = Array.isArray(prod.images) && prod.images.length > 0 ? prod.images : (prod.imageUrl ? [prod.imageUrl] : []);
    const categoryIdsList = Array.isArray(prod.categoryIds) && prod.categoryIds.length > 0 ? prod.categoryIds : (prod.categoryId ? [prod.categoryId] : []);
    const productName = prod.nameEn || prod.name || 'Flower Item';

    const existingProds = await db.getProducts();
    const maxSl = existingProds.reduce((max, item) => Math.max(max, Number(item.slNo || 0)), 0);
    const assignedSlNo = prod.slNo ? Number(prod.slNo) : (maxSl + 1);

    const prodUnit = prod.unit || (Array.isArray(prod.unitVariants) && prod.unitVariants[0]?.unit) || 'piece';

    const newProd = {
      ...prod,
      id: prod.id || `prod_${Date.now()}`,
      slNo: assignedSlNo,
      name: productName,
      nameEn: productName,
      unit: prodUnit,
      categoryIds: categoryIdsList,
      images: imagesList,
      imageUrl: imagesList[0] || '',
      price: Number(prod.price),
      discountType: prod.discountType || 'none',
      discountValue: Number(prod.discountValue || 0),
      unitVariants: Array.isArray(prod.unitVariants) && prod.unitVariants.length > 0 ? prod.unitVariants : [{ unit: prodUnit, price: Number(prod.price) }],
      inStock: prod.inStock !== false,
      isSeasonal: Boolean(prod.isSeasonal || prod.is_seasonal),
      seasonalTag: prod.seasonalTag || prod.seasonal_tag || ''
    };

    // ALWAYS write to local file DB & memory cache FIRST!
    try {
      const local = readDb();
      local.products = local.products || [];
      const existingIdx = local.products.findIndex((p) => p.id === newProd.id);
      if (existingIdx >= 0) {
        local.products[existingIdx] = newProd;
      } else {
        local.products.unshift(newProd);
      }
      writeDb(local);
    } catch (e) {
      console.warn('writeDb skipped:', e);
    }

    if (supabase) {
      try {
        const payload = {
          id: newProd.id,
          name: productName,
          price: newProd.price,
          unit: newProd.unit || 'piece',
          discount_type: newProd.discountType,
          discount_value: newProd.discountValue,
          image_url: newProd.imageUrl,
          images: newProd.images,
          category_ids: newProd.categoryIds,
          unit_variants: newProd.unitVariants,
          in_stock: newProd.inStock,
          is_seasonal: newProd.isSeasonal,
          seasonal_tag: newProd.seasonalTag,
          description: newProd.description || ''
        };

        await supabase.from('products').upsert([{ ...payload, sl_no: newProd.slNo }]);
      } catch (err) {
        console.error('Supabase addProduct exception:', err);
      }
    }

    return newProd;
  },
  updateProduct: async (id, updated) => {
    const imagesList = Array.isArray(updated.images) && updated.images.length > 0
      ? updated.images
      : (updated.imageUrl ? [updated.imageUrl] : []);
    const categoryIdsList = Array.isArray(updated.categoryIds) && updated.categoryIds.length > 0
      ? updated.categoryIds
      : (updated.categoryId ? [updated.categoryId] : []);
    const productName = updated.nameEn || updated.name;

    if (supabase) {
      try {
        const payload = {};
        if (productName !== undefined) payload.name = productName;
        if (updated.slNo !== undefined) payload.sl_no = Number(updated.slNo);
        if (updated.price !== undefined) payload.price = Number(updated.price);
        if (updated.unit !== undefined) payload.unit = updated.unit;
        if (updated.discountType !== undefined) payload.discount_type = updated.discountType;
        if (updated.discountValue !== undefined) payload.discount_value = Number(updated.discountValue);
        if (imagesList.length > 0) {
          payload.images = imagesList;
          payload.image_url = imagesList[0];
        }
        if (categoryIdsList.length > 0) payload.category_ids = categoryIdsList;
        if (updated.unitVariants !== undefined) payload.unit_variants = updated.unitVariants;
        if (updated.inStock !== undefined) payload.in_stock = updated.inStock;
        if (updated.isSeasonal !== undefined) payload.is_seasonal = updated.isSeasonal;
        if (updated.seasonalTag !== undefined) payload.seasonal_tag = updated.seasonalTag;
        if (updated.description !== undefined) payload.description = updated.description;

        const { data, error } = await supabase.from('products').update(payload).eq('id', id).select().single();
        if (error) console.error('Supabase updateProduct error:', error);
      } catch (e) {
        console.error('Supabase updateProduct exception:', e);
      }
    }

    const local = readDb();
    local.products = (local.products || []).map(p => {
      if (p.id === id) {
        return {
          ...p,
          ...updated,
          name: productName || p.name,
          nameEn: productName || p.nameEn || p.name,
          slNo: updated.slNo !== undefined ? Number(updated.slNo) : (p.slNo || 1),
          unit: updated.unit !== undefined ? updated.unit : (p.unit || (Array.isArray(p.unitVariants) && p.unitVariants[0]?.unit) || 'piece'),
          categoryIds: categoryIdsList.length > 0 ? categoryIdsList : p.categoryIds || [],
          images: imagesList.length > 0 ? imagesList : p.images || [],
          imageUrl: imagesList[0] || p.imageUrl || '',
          price: Number(updated.price !== undefined ? updated.price : p.price),
          discountValue: Number(updated.discountValue !== undefined ? updated.discountValue : p.discountValue),
          unitVariants: Array.isArray(updated.unitVariants) ? updated.unitVariants : p.unitVariants || [],
          isSeasonal: updated.isSeasonal !== undefined ? Boolean(updated.isSeasonal) : Boolean(p.isSeasonal),
          seasonalTag: updated.seasonalTag !== undefined ? updated.seasonalTag : (p.seasonalTag || '')
        };
      }
      return p;
    });
    writeDb(local);
    return db.getProductById(id);
  },
  deleteProduct: async (id) => {
    if (supabase) {
      await supabase.from('products').delete().eq('id', id);
    }
    const local = readDb();
    local.products = (local.products || []).filter(p => p.id !== id);
    writeDb(local);
  },

  // Banners
  getBanners: async () => {
    let supabaseBanners = null;
    if (supabase) {
      try {
        let res = await supabase.from('banners').select('*').eq('active', true);
        if (res.error || !res.data || res.data.length === 0) {
          res = await supabase.from('banners').select('*');
        }
        if (!res.error && res.data && res.data.length > 0) {
          supabaseBanners = res.data.map((b) => ({
            ...b,
            id: String(b.id),
            imageUrl: b.image_url || b.imageUrl || '',
            title: b.title || '',
            subtitle: b.subtitle || '',
            badge: b.badge || b.badge_text || '',
            badgeText: b.badge || b.badge_text || '',
            categoryId: b.category_id || b.categoryId || '',
            targetUrl: b.target_url || b.targetUrl || (b.category_id ? `/category/${b.category_id}` : '/shop')
          }));
        }
      } catch (e) {
        console.error('Supabase getBanners error:', e);
      }
    }
    const localBanners = (readDb().banners || []).map((b) => ({
      ...b,
      id: String(b.id),
      imageUrl: b.imageUrl || b.image_url || '',
      title: b.title || '',
      subtitle: b.subtitle || '',
      badge: b.badge || b.badgeText || '',
      badgeText: b.badge || b.badgeText || '',
      categoryId: b.categoryId || b.category_id || '',
      targetUrl: b.targetUrl || b.target_url || (b.categoryId ? `/category/${b.categoryId}` : '/shop')
    }));

    if (supabaseBanners && supabaseBanners.length > 0) {
      return supabaseBanners;
    }
    return localBanners;
  },
  updateBanners: async (banners) => {
    const bannerList = Array.isArray(banners) ? banners : [banners];
    const formattedBanners = bannerList.map((b, idx) => ({
      id: b.id ? String(b.id) : `b_${Date.now()}_${idx}`,
      title: b.title || '',
      subtitle: b.subtitle || '',
      badge: b.badge || b.badgeText || '',
      image_url: b.imageUrl || b.image_url || '',
      category_id: b.categoryId || b.category_id || '',
      target_url: b.targetUrl || b.target_url || (b.categoryId ? `/category/${b.categoryId}` : '/shop'),
      active: true
    }));

    // Always update local cache & file storage first so user changes never disappear!
    const local = readDb();
    const finalLocalBanners = formattedBanners.map((b) => ({
      ...b,
      id: String(b.id),
      imageUrl: b.image_url || b.imageUrl || '',
      badgeText: b.badge || '',
      categoryId: b.category_id || '',
      targetUrl: b.target_url || (b.category_id ? `/category/${b.category_id}` : '/shop')
    }));
    local.banners = finalLocalBanners;
    writeDb(local);

    if (supabase) {
      try {
        // Fetch existing banners in Supabase to sync deletions
        const { data: existingSupabaseBanners } = await supabase.from('banners').select('id');
        if (Array.isArray(existingSupabaseBanners)) {
          const activeIdsSet = new Set(formattedBanners.map((b) => String(b.id)));
          const idsToDelete = existingSupabaseBanners
            .map((e) => String(e.id))
            .filter((id) => !activeIdsSet.has(id));

          for (const delId of idsToDelete) {
            await supabase.from('banners').delete().eq('id', delId);
          }
        }

        if (formattedBanners.length > 0) {
          const { error } = await supabase.from('banners').upsert(formattedBanners);
          if (error) {
            console.error('Supabase updateBanners upsert error:', error);
          }
        } else {
          await supabase.from('banners').delete().neq('id', '___none___');
        }
      } catch (e) {
        console.error('Supabase updateBanners exception:', e);
      }
    }

    return finalLocalBanners;
  },

  // Orders
  getOrders: async () => {
    const ordersMap = new Map();
    if (supabase) {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        data.forEach(o => {
          ordersMap.set(o.id, {
            id: o.id,
            user_id: o.user_id,
            userId: o.user_id,
            customerName: o.customer_name,
            customerPhone: o.customer_phone,
            customerAddress: o.customer_address || o.delivery_address || '',
            deliveryAddress: o.customer_address || o.delivery_address || '',
            deliveryDate: o.delivery_date,
            deliveryTimeSlot: o.delivery_time_slot || 'Morning (9 AM - 12 PM)',
            items: o.items || [],
            total: Number(o.total_amount || o.total || 0),
            total_amount: Number(o.total_amount || o.total || 0),
            discountAmount: Number(o.discount_amount || 0),
            couponCode: o.coupon_code || null,
            status: o.status || 'placed',
            paymentStatus: o.payment_status || 'pending',
            payment_status: o.payment_status || 'pending',
            paymentMethod: o.payment_method || 'cod',
            payment_method: o.payment_method || 'cod',
            advanceAmount: o.advance_amount !== undefined ? o.advance_amount : null,
            advance_amount: o.advance_amount !== undefined ? o.advance_amount : null,
            remainingAmount: o.remaining_amount !== undefined ? o.remaining_amount : null,
            remaining_amount: o.remaining_amount !== undefined ? o.remaining_amount : null,
            paymentLink: o.payment_link || null,
            payment_link: o.payment_link || null,
            razorpay_payment_id: o.razorpay_payment_id || null,
            orderNote: o.notes || '',
            notes: o.notes || '',
            createdAt: o.created_at || new Date().toISOString()
          });
        });
      }
    }
    const localOrders = readDb().orders || [];
    localOrders.forEach(o => {
      if (!ordersMap.has(o.id)) {
        ordersMap.set(o.id, o);
      }
    });

    return Array.from(ordersMap.values()).sort(
      (a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at)
    );
  },
  getOrderById: async (id) => {
    if (supabase) {
      const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
      if (!error && data) {
        return {
          id: data.id,
          user_id: data.user_id,
          userId: data.user_id,
          customerName: data.customer_name,
          customerPhone: data.customer_phone,
          customerAddress: data.customer_address || data.delivery_address || '',
          deliveryAddress: data.customer_address || data.delivery_address || '',
          deliveryDate: data.delivery_date,
          deliveryTimeSlot: data.delivery_time_slot || 'Morning (9 AM - 12 PM)',
          items: data.items || [],
          total: Number(data.total_amount || data.total || 0),
          total_amount: Number(data.total_amount || data.total || 0),
          discountAmount: Number(data.discount_amount || 0),
          couponCode: data.coupon_code || null,
          status: data.status || 'placed',
          paymentStatus: data.payment_status || 'pending',
          payment_status: data.payment_status || 'pending',
          paymentMethod: data.payment_method || 'cod',
          payment_method: data.payment_method || 'cod',
          advanceAmount: data.advance_amount !== undefined ? data.advance_amount : null,
          advance_amount: data.advance_amount !== undefined ? data.advance_amount : null,
          remainingAmount: data.remaining_amount !== undefined ? data.remaining_amount : null,
          remaining_amount: data.remaining_amount !== undefined ? data.remaining_amount : null,
          paymentLink: data.payment_link || null,
          payment_link: data.payment_link || null,
          razorpay_payment_id: data.razorpay_payment_id || null,
          orderNote: data.notes || '',
          notes: data.notes || '',
          createdAt: data.created_at || new Date().toISOString()
        };
      }
    }
    return (readDb().orders || []).find(o => o.id === id);
  },
  getOrdersByPhone: async (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) return [];
    if (supabase) {
      const { data, error } = await supabase.from('orders').select('*').ilike('customer_phone', `%${cleanPhone}%`).order('created_at', { ascending: false });
      if (!error && data) {
        return data.map(o => ({
          id: o.id,
          customerName: o.customer_name,
          customerPhone: o.customer_phone,
          customerAddress: o.customer_address,
          deliveryAddress: o.customer_address || o.delivery_address || o.deliveryAddress || '',
          deliveryDate: o.delivery_date || o.deliveryDate || '',
          deliveryTimeSlot: o.delivery_time_slot || o.deliveryTimeSlot || 'Morning',
          items: o.items || [],
          total: Number(o.total_amount || o.total || 0),
          deliveryCharge: Number(o.delivery_charge || o.deliveryCharge || 0),
          isBulkOrder: Boolean(o.is_bulk_order || o.isBulkOrder),
          status: o.status,
          paymentMethod: o.payment_method || o.paymentMethod || 'cod',
          paymentStatus: o.payment_status || o.paymentStatus || 'pending',
          payment_method: o.payment_method || o.paymentMethod || 'cod',
          payment_status: o.payment_status || o.paymentStatus || 'pending',
          advanceAmount: o.advance_amount || o.advanceAmount || null,
          remainingAmount: o.remaining_amount || o.remainingAmount || null,
          advance_amount: o.advance_amount || o.advanceAmount || null,
          remaining_amount: o.remaining_amount || o.remainingAmount || null,
          razorpay_payment_id: o.razorpay_payment_id || null,
          orderNote: o.notes || o.orderNote || '',
          notes: o.notes || o.orderNote || '',
          createdAt: o.created_at || o.createdAt
        }));
      }
    }
    const orders = readDb().orders || [];
    return orders.filter(o => {
      const p = (o.customerPhone || '').replace(/\D/g, '');
      return p.includes(cleanPhone) || cleanPhone.includes(p);
    }).map(o => ({
      ...o,
      deliveryAddress: o.deliveryAddress || o.customerAddress || '',
      deliveryTimeSlot: o.deliveryTimeSlot || o.delivery_time_slot || 'Morning',
      orderNote: o.orderNote || o.notes || ''
    }));
  },
  createOrder: async (orderData) => {
    let orderCount = 0;
    try {
      const existingOrders = await db.getOrders();
      orderCount = Array.isArray(existingOrders) ? existingOrders.length : 0;
    } catch (e) {
      console.warn('Order count fallback:', e);
    }
    const nextNum = orderCount + 1;
    const paddedStr = String(nextNum).padStart(8, '0');
    const orderId = `FLW-${paddedStr.slice(0, 4)}-${paddedStr.slice(4)}`;
    
    const newOrder = {
      ...orderData,
      id: orderId,
      status: orderData.status || 'placed',
      payment_method: orderData.payment_method || orderData.paymentMethod || 'cod',
      payment_status: orderData.payment_status || orderData.paymentStatus || 'pending',
      advance_amount: orderData.advance_amount || orderData.advanceAmount || null,
      remaining_amount: orderData.remaining_amount || orderData.remainingAmount || null,
      userId: orderData.userId || orderData.user_id || null,
      createdAt: new Date().toISOString()
    };

    if (supabase) {
      const { data, error } = await supabase.from('orders').insert([{
        id: orderId,
        user_id: orderData.userId || orderData.user_id || null,
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        customer_address: orderData.customerAddress || orderData.deliveryAddress,
        delivery_date: orderData.deliveryDate || null,
        delivery_time_slot: orderData.deliveryTimeSlot || null,
        items: orderData.items || [],
        total_amount: Number(orderData.total || 0),
        discount_amount: Number(orderData.discountAmount || 0),
        coupon_code: orderData.couponCode || null,
        status: orderData.status || 'placed',
        payment_method: orderData.payment_method || orderData.paymentMethod || 'cod',
        payment_status: orderData.payment_status || orderData.paymentStatus || 'pending',
        advance_amount: orderData.advance_amount || orderData.advanceAmount || null,
        remaining_amount: orderData.remaining_amount || orderData.remainingAmount || null,
        razorpay_order_id: orderData.razorpay_order_id || null,
        razorpay_payment_id: orderData.razorpay_payment_id || null,
        notes: orderData.orderNote || orderData.notes || ''
      }]).select().single();
      if (!error && data) return newOrder;
    }

    const local = readDb();
    local.orders = local.orders || [];
    local.orders.unshift(newOrder);
    writeDb(local);
    return newOrder;
  },
  updateOrderStatus: async (id, status) => {
    if (supabase) {
      const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single();
      if (!error && data) return db.getOrderById(id);
    }
    const local = readDb();
    local.orders = (local.orders || []).map(o => o.id === id ? { ...o, status } : o);
    writeDb(local);
    return local.orders.find(o => o.id === id);
  },
  updateOrder: async (id, updatedFields) => {
    let updatedObj = null;

    if (supabase) {
      try {
        const payload = {};
        if (updatedFields.status !== undefined) payload.status = updatedFields.status;
        if (updatedFields.paymentStatus !== undefined) payload.payment_status = updatedFields.paymentStatus;
        if (updatedFields.notes !== undefined) payload.notes = updatedFields.notes;
        if (updatedFields.orderNote !== undefined) payload.notes = updatedFields.orderNote;
        if (updatedFields.total !== undefined) payload.total_amount = Number(updatedFields.total);
        if (updatedFields.deliveryCharge !== undefined) payload.delivery_charge = Number(updatedFields.deliveryCharge);
        if (updatedFields.isBulkOrder !== undefined) payload.is_bulk_order = updatedFields.isBulkOrder;

        if (Object.keys(payload).length > 0) {
          const { data, error } = await supabase.from('orders').update(payload).eq('id', id).select().single();
          if (error) {
            console.error('Supabase updateOrder error:', error);
          } else if (data) {
            updatedObj = await db.getOrderById(id);
          }
        }
      } catch (e) {
        console.error('Supabase updateOrder exception:', e);
      }
    }

    const local = readDb();
    let localObj = null;
    local.orders = (local.orders || []).map(o => {
      if (o.id === id) {
        localObj = { ...o, ...updatedFields };
        return localObj;
      }
      return o;
    });
    try { writeDb(local); } catch (e) {}

    return updatedObj || localObj || (await db.getOrderById(id)) || { id, ...updatedFields };
  },
  deleteOrder: async (id) => {
    if (supabase) {
      try {
        await supabase.from('order_status_history').delete().eq('order_id', id);
        await supabase.from('orders').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase deleteOrder error:', e);
      }
    }
    const local = readDb();
    local.orders = (local.orders || []).filter((o) => String(o.id) !== String(id));
    try {
      writeDb(local);
    } catch (e) {
      console.warn('writeDb deleteOrder skipped:', e);
    }
    return true;
  },

  // Admin Auth
  verifyAdmin: async (username, password) => {
    if (supabase) {
      const { data, error } = await supabase.from('admins').select('*').eq('username', username).eq('password', password).maybeSingle();
      if (!error && data) return true;
    }
    const validAdmins = [
      { username: 'admin_1', password: 'Ratik@2892' },
      { username: 'Likhith', password: 'Likhith@0501' }
    ];
    return validAdmins.some(a => a.username === username && a.password === password);
  },

  // Coupon System
  getCoupons: async () => {
    let supabaseCoupons = [];
    if (supabase) {
      try {
        const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          supabaseCoupons = data;
        }
      } catch (e) {
        console.error('Supabase getCoupons error:', e);
      }
    }
    const local = readDb();
    const localCoupons = Array.isArray(local.coupons) && local.coupons.length > 0 ? local.coupons : INITIAL_COUPONS;

    // Merge local data.json coupons and Supabase coupons seamlessly by code
    const couponMap = new Map();
    localCoupons.forEach(c => {
      if (c && c.code) couponMap.set(c.code.toUpperCase(), c);
    });
    supabaseCoupons.forEach(c => {
      if (c && c.code) couponMap.set(c.code.toUpperCase(), c);
    });

    return Array.from(couponMap.values());
  },

  getCouponByCode: async (code) => {
    if (!code) return null;
    const uppercaseCode = code.trim().toUpperCase();
    
    // First search in getCoupons() which merges local and Supabase
    const allCoupons = await db.getCoupons();
    const found = allCoupons.find(c => (c.code || '').toUpperCase() === uppercaseCode);
    if (found) return found;

    if (supabase) {
      try {
        const { data, error } = await supabase.from('coupons').select('*').eq('code', uppercaseCode).single();
        if (!error && data) return data;
      } catch (e) {
        console.error('Supabase getCouponByCode error:', e);
      }
    }
    return null;
  },

  addCoupon: async (coupon) => {
    const formatted = {
      id: coupon.id || `c_${Date.now()}`,
      code: (coupon.code || '').trim().toUpperCase(),
      discount_type: coupon.discount_type || coupon.discountType || 'flat',
      discount_value: Number(coupon.discount_value || coupon.discountValue || 0),
      min_order_value: coupon.min_order_value !== undefined && coupon.min_order_value !== '' ? Number(coupon.min_order_value) : null,
      max_discount_amount: coupon.max_discount_amount !== undefined && coupon.max_discount_amount !== '' ? Number(coupon.max_discount_amount) : null,
      is_first_order_only: Boolean(coupon.is_first_order_only || coupon.isFirstOrderOnly),
      is_active: coupon.is_active !== false,
      usage_limit_per_customer: Number(coupon.usage_limit_per_customer || 1),
      valid_from: coupon.valid_from || null,
      valid_until: coupon.valid_until || null,
      created_at: new Date().toISOString()
    };

    // Always update local cache & file storage first so user coupon additions never vanish!
    const local = readDb();
    local.coupons = Array.isArray(local.coupons) ? local.coupons : [];
    const existingIdx = local.coupons.findIndex(c => c.id === formatted.id || c.code === formatted.code);
    if (existingIdx >= 0) {
      local.coupons[existingIdx] = formatted;
    } else {
      local.coupons.unshift(formatted);
    }
    try { writeDb(local); } catch (e) {}

    if (supabase) {
      try {
        const { data, error } = await supabase.from('coupons').upsert([formatted]).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.error('Supabase addCoupon error:', e);
      }
    }

    return formatted;
  },

  updateCoupon: async (id, updated) => {
    // Always update local cache & file storage first!
    const local = readDb();
    local.coupons = (local.coupons || []).map(c => c.id === id ? { ...c, ...updated } : c);
    try { writeDb(local); } catch (e) {}
    const updatedLocal = local.coupons.find(c => c.id === id);

    if (supabase) {
      try {
        const { data, error } = await supabase.from('coupons').update(updated).eq('id', id).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.error('Supabase updateCoupon error:', e);
      }
    }
    return updatedLocal;
  },

  deleteCoupon: async (id) => {
    const targetIdOrCode = String(id || '').trim().toUpperCase();
    // Always delete from local cache & file storage first!
    const local = readDb();
    local.coupons = (local.coupons || []).filter(c => 
      c.id !== id && 
      (c.code || '').toUpperCase() !== targetIdOrCode &&
      (c.id || '').toUpperCase() !== targetIdOrCode
    );
    try { writeDb(local); } catch (e) {}

    if (supabase) {
      try {
        await supabase.from('coupons').delete().or(`id.eq.${id},code.eq.${targetIdOrCode}`);
      } catch (e) {
        console.error('Supabase deleteCoupon error:', e);
      }
    }
    return true;
  },

  // Promo Offer Banner Persistence
  getPromoBanner: async () => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('promo_banner').select('*').eq('id', 'main_promo').single();
        if (!error && data) {
          return {
            enabled: data.enabled !== false,
            badgeText: data.badge_text || data.badgeText || DEFAULT_PROMO_BANNER.badgeText,
            couponCode: data.coupon_code || data.couponCode || DEFAULT_PROMO_BANNER.couponCode,
            title: data.title || DEFAULT_PROMO_BANNER.title,
            subtitle: data.subtitle || DEFAULT_PROMO_BANNER.subtitle,
            buttonText: data.button_text || data.buttonText || DEFAULT_PROMO_BANNER.buttonText
          };
        }
      } catch (e) {
        console.error('Supabase getPromoBanner error:', e);
      }
    }
    const local = readDb();
    return local.promoBanner || DEFAULT_PROMO_BANNER;
  },

  updatePromoBanner: async (newConfig) => {
    const local = readDb();
    const current = local.promoBanner || DEFAULT_PROMO_BANNER;

    const updated = {
      enabled: newConfig.enabled !== undefined ? Boolean(newConfig.enabled) : current.enabled,
      badgeText: newConfig.badgeText !== undefined ? newConfig.badgeText : (newConfig.badge_text !== undefined ? newConfig.badge_text : current.badgeText),
      couponCode: newConfig.couponCode !== undefined ? newConfig.couponCode : (newConfig.coupon_code !== undefined ? newConfig.coupon_code : current.couponCode),
      title: newConfig.title !== undefined ? newConfig.title : current.title,
      subtitle: newConfig.subtitle !== undefined ? newConfig.subtitle : current.subtitle,
      buttonText: newConfig.buttonText !== undefined ? newConfig.buttonText : (newConfig.button_text !== undefined ? newConfig.button_text : current.buttonText)
    };

    // Always update local cache & file storage first!
    local.promoBanner = updated;
    try { writeDb(local); } catch (e) {}

    if (supabase) {
      try {
        const payload = {
          id: 'main_promo',
          enabled: updated.enabled,
          badge_text: updated.badgeText,
          coupon_code: updated.couponCode,
          title: updated.title,
          subtitle: updated.subtitle,
          button_text: updated.buttonText,
          updated_at: new Date().toISOString()
        };
        await supabase.from('promo_banner').upsert([payload]);
      } catch (e) {
        console.error('Supabase updatePromoBanner error:', e);
      }
    }

    return updated;
  },

  validateCoupon: async ({ code, customerPhone, userId, cartTotal }) => {
    if (!code) return { valid: false, error: 'Please enter a coupon code.' };
    const uppercaseCode = code.trim().toUpperCase();

    const coupon = await db.getCouponByCode(uppercaseCode);
    if (!coupon) return { valid: false, error: 'Invalid coupon code.' };

    if (!coupon.is_active) return { valid: false, error: 'This coupon code is inactive or expired.' };

    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return { valid: false, error: 'This coupon is not yet valid.' };
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return { valid: false, error: 'This coupon has expired.' };
    }

    if (coupon.min_order_value && Number(cartTotal) < Number(coupon.min_order_value)) {
      return { valid: false, error: `Minimum order value is ₹${coupon.min_order_value} to use this coupon.` };
    }

    // Phone-based First Order Check
    const cleanPhone = (customerPhone || '').replace(/\D/g, '');

    if (coupon.is_first_order_only) {
      // Query orders table for ANY order matching cleanPhone or userId
      let hasPreviousOrders = false;
      const allOrders = await db.getOrders();

      if (cleanPhone) {
        hasPreviousOrders = allOrders.some(o => {
          if (o.status && o.status.toLowerCase() === 'cancelled') return false;
          const op = (o.customerPhone || o.customer_phone || '').replace(/\D/g, '');
          return op.length >= 10 && cleanPhone.length >= 10 && (op.includes(cleanPhone) || cleanPhone.includes(op));
        });
      }

      if (!hasPreviousOrders && userId) {
        hasPreviousOrders = allOrders.some(o => {
          if (o.status && o.status.toLowerCase() === 'cancelled') return false;
          return o.user_id === userId || o.userId === userId;
        });
      }

      if (hasPreviousOrders) {
        return { valid: false, error: 'This coupon is only valid for your first order.' };
      }
    }

    // Phone-based Usage Limit Check
    let usageCount = 0;
    let usages = [];
    if (supabase) {
      try {
        const { data } = await supabase.from('coupon_usage').select('*').eq('coupon_id', coupon.id);
        if (data) usages = data;
      } catch (e) {}
    } else {
      usages = readDb().coupon_usage || [];
    }

    if (cleanPhone) {
      usageCount = usages.filter(u => {
        const up = (u.customer_phone || u.customerPhone || '').replace(/\D/g, '');
        return u.coupon_id === coupon.id && up.length >= 10 && cleanPhone.length >= 10 && (up.includes(cleanPhone) || cleanPhone.includes(up));
      }).length;
    }
    if (usageCount === 0 && userId) {
      usageCount = usages.filter(u => u.coupon_id === coupon.id && (u.user_id === userId || u.userId === userId)).length;
    }

    const limit = Number(coupon.usage_limit_per_customer || 1);
    if (usageCount >= limit) {
      return { valid: false, error: "You've already used this coupon." };
    }

    // Calculate discount amount
    let discountAmount = 0;
    const numValue = Number(coupon.discount_value || 0);

    if (coupon.discount_type === 'flat') {
      discountAmount = Math.min(numValue, Number(cartTotal));
    } else if (coupon.discount_type === 'percentage') {
      discountAmount = (Number(cartTotal) * numValue) / 100;
      if (coupon.max_discount_amount && discountAmount > Number(coupon.max_discount_amount)) {
        discountAmount = Number(coupon.max_discount_amount);
      }
      discountAmount = Math.min(discountAmount, Number(cartTotal));
    }

    discountAmount = Math.round(discountAmount);

    return {
      valid: true,
      coupon,
      code: coupon.code,
      discountAmount,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value
    };
  },

  recordCouponUsage: async ({ couponId, userId, customerPhone, orderId }) => {
    const record = {
      id: `cu_${Date.now()}`,
      coupon_id: couponId,
      user_id: userId || null,
      customer_phone: customerPhone || null,
      order_id: orderId || null,
      used_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        await supabase.from('coupon_usage').insert([record]);
      } catch (e) {
        console.error('Supabase recordCouponUsage error:', e);
      }
    }

    const local = readDb();
    local.coupon_usage = local.coupon_usage || [];
    local.coupon_usage.push(record);
    try { writeDb(local); } catch (e) {}
    return record;
  }
};

