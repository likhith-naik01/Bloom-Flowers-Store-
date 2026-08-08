-- Supabase PostgreSQL Schema for Bloom Flower Shop Platform

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  discount_value NUMERIC DEFAULT 0,
  image_url TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  category_ids JSONB DEFAULT '[]'::jsonb,
  unit_variants JSONB DEFAULT '[]'::jsonb,
  in_stock BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  delivery_date DATE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'new',
  payment_status TEXT DEFAULT 'cod',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Banners Table
CREATE TABLE IF NOT EXISTS banners (
  id SERIAL PRIMARY KEY,
  title TEXT,
  subtitle TEXT,
  badge TEXT,
  image_url TEXT NOT NULL,
  link TEXT,
  active BOOLEAN DEFAULT true
);

ALTER TABLE banners ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS badge TEXT;

-- 5. Admins Table
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products USING gin(category_ids);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Initial Admins
INSERT INTO admins (username, password)
VALUES 
  ('admin_1', 'Ratik@2892'),
  ('Likhith', 'Likhith@0501')
ON CONFLICT (username) DO NOTHING;
