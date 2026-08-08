import fs from 'fs';
import path from 'path';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_BANNERS, INITIAL_ORDERS } from './sampleData.js';
import { supabase } from './supabase.js';

const DB_PATH = path.join(process.cwd(), 'data.json');
const TMP_PATH = path.join(process.cwd(), 'data.json.tmp');

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
    if (supabase) {
      try {
        let res = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (res.error) {
          res = await supabase.from('products').select('*');
        }
        if (!res.error && res.data) {
          const mapped = res.data.map((p, idx) => ({
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
            inStock: p.in_stock !== false
          }));

          const sorted = mapped.sort((a, b) => Number(a.slNo || 0) - Number(b.slNo || 0));
          
          const seen = new Set();
          let maxSl = 0;
          sorted.forEach(p => { if (Number(p.slNo) > maxSl) maxSl = Number(p.slNo); });

          const uniqueList = sorted.map((p, idx) => {
            let sl = Number(p.slNo || 0);
            if (sl <= 0 || seen.has(sl)) {
              maxSl += 1;
              sl = maxSl;
            }
            seen.add(sl);
            return { ...p, slNo: sl };
          });

          return uniqueList.sort((a, b) => Number(a.slNo || 0) - Number(a.slNo || 0));
        }
      } catch (e) {
        console.error('Supabase getProducts error:', e);
      }
    }

    const prods = readDb().products || [];
    const list = prods.map((p, idx) => ({
      ...p,
      slNo: Number(p.sl_no || p.slNo || (idx + 1)),
      nameEn: p.nameEn || p.name || '',
      unit: p.unit || (Array.isArray(p.unitVariants) && p.unitVariants[0]?.unit) || 'piece',
      categoryIds: Array.isArray(p.categoryIds) ? p.categoryIds : (p.categoryId ? [p.categoryId] : []),
      images: Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.imageUrl ? [p.imageUrl] : []),
      imageUrl: p.imageUrl || (Array.isArray(p.images) && p.images[0] ? p.images[0] : ''),
      unitVariants: Array.isArray(p.unitVariants) ? p.unitVariants : [],
      discountType: p.discountType || 'none'
    }));
    return list.sort((a, b) => Number(a.slNo || 0) - Number(a.slNo || 0));
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
          inStock: data.in_stock !== false
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
      inStock: prod.inStock !== false
    };

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
          description: newProd.description || ''
        };

        const res1 = await supabase.from('products').insert([{ ...payload, sl_no: newProd.slNo }]).select().single();
        if (!res1.error && res1.data) {
          return { ...newProd, ...res1.data };
        }

        const res2 = await supabase.from('products').insert([payload]).select().single();
        if (!res2.error && res2.data) {
          return { ...newProd, ...res2.data };
        }

        // Minimal fallback with standard columns in case custom columns are missing
        const res3 = await supabase.from('products').insert([{
          id: newProd.id,
          name: productName,
          price: newProd.price,
          unit: newProd.unit || 'piece',
          image_url: newProd.imageUrl,
          description: newProd.description || ''
        }]).select().single();
        if (!res3.error && res3.data) {
          return { ...newProd, ...res3.data };
        }

        // Fallback without specifying id (in case Supabase expects auto-generated id)
        const res4 = await supabase.from('products').insert([{
          name: productName,
          price: newProd.price,
          unit: newProd.unit || 'piece',
          image_url: newProd.imageUrl,
          description: newProd.description || ''
        }]).select().single();
        if (!res4.error && res4.data) {
          return { ...newProd, ...res4.data, id: res4.data.id || newProd.id };
        }

        const lastError = res1.error || res2.error || res3.error || res4.error;
        if (lastError) {
          console.error('Supabase addProduct insert failed:', lastError);
          return { error: lastError.message || 'Supabase insert failed' };
        }
      } catch (err) {
        console.error('Supabase addProduct exception:', err);
        return { error: err.message };
      }
    }

    try {
      const local = readDb();
      local.products = local.products || [];
      local.products.push(newProd);
      writeDb(local);
    } catch (e) {
      console.warn('writeDb skipped:', e);
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
          unitVariants: Array.isArray(updated.unitVariants) ? updated.unitVariants : p.unitVariants || []
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
    if (supabase) {
      const { data, error } = await supabase.from('banners').select('*').eq('active', true);
      if (!error && data && data.length > 0) {
        return data.map(b => ({
          ...b,
          imageUrl: b.image_url || b.imageUrl || '',
          title: b.title || '',
          subtitle: b.subtitle || '',
          badge: b.badge || ''
        }));
      }
    }
    const localBanners = readDb().banners || [];
    return localBanners.map(b => ({
      ...b,
      imageUrl: b.imageUrl || b.image_url || '',
      title: b.title || '',
      subtitle: b.subtitle || '',
      badge: b.badge || ''
    }));
  },
  updateBanners: async (banners) => {
    const formattedBanners = banners.map(b => ({
      title: b.title || '',
      subtitle: b.subtitle || '',
      badge: b.badge || '',
      image_url: b.imageUrl || b.image_url || '',
      active: true
    }));

    if (supabase) {
      await supabase.from('banners').delete().neq('id', -1);
      const { data, error } = await supabase.from('banners').insert(formattedBanners).select();
      if (error) {
        console.error('Supabase updateBanners error:', error);
      }
      if (!error && data) {
        return data.map(b => ({
          ...b,
          imageUrl: b.image_url || b.imageUrl || ''
        }));
      }
    }
    const local = readDb();
    local.banners = banners.map(b => ({
      ...b,
      imageUrl: b.imageUrl || b.image_url || ''
    }));
    writeDb(local);
    return local.banners;
  },

  // Orders
  getOrders: async () => {
    if (supabase) {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        return data.map(o => ({
          id: o.id,
          customerName: o.customer_name,
          customerPhone: o.customer_phone,
          customerAddress: o.customer_address,
          deliveryDate: o.delivery_date,
          items: o.items || [],
          total: Number(o.total_amount || 0),
          status: o.status,
          paymentStatus: o.payment_status,
          notes: o.notes,
          createdAt: o.created_at
        }));
      }
    }
    return readDb().orders || [];
  },
  getOrderById: async (id) => {
    if (supabase) {
      const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
      if (!error && data) {
        return {
          id: data.id,
          customerName: data.customer_name,
          customerPhone: data.customer_phone,
          customerAddress: data.customer_address,
          deliveryDate: data.delivery_date,
          items: data.items || [],
          total: Number(data.total_amount || 0),
          status: data.status,
          paymentStatus: data.payment_status,
          notes: data.notes,
          createdAt: data.created_at
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
          deliveryDate: o.delivery_date,
          items: o.items || [],
          total: Number(o.total_amount || 0),
          status: o.status,
          paymentStatus: o.payment_status,
          notes: o.notes,
          createdAt: o.created_at
        }));
      }
    }
    const orders = readDb().orders || [];
    return orders.filter(o => {
      const p = (o.customerPhone || '').replace(/\D/g, '');
      return p.includes(cleanPhone) || cleanPhone.includes(p);
    });
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
      status: 'new',
      paymentStatus: 'cod',
      createdAt: new Date().toISOString()
    };

    if (supabase) {
      const { data, error } = await supabase.from('orders').insert([{
        id: orderId,
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        customer_address: orderData.customerAddress || orderData.deliveryAddress,
        delivery_date: orderData.deliveryDate || null,
        items: orderData.items || [],
        total_amount: Number(orderData.total || 0),
        status: 'new',
        payment_status: 'cod',
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
  }
};

