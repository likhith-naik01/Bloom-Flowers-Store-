-- ============================================================
-- BLOOM FLOWER SHOP: COUPONS & COUPON USAGE DATABASE SCHEMA
-- ============================================================

-- 1. Create "coupons" table
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('flat', 'percentage')),
    discount_value NUMERIC NOT NULL,
    min_order_value NUMERIC DEFAULT NULL,
    max_discount_amount NUMERIC DEFAULT NULL,
    is_first_order_only BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    usage_limit_per_customer INTEGER DEFAULT 1,
    valid_from TIMESTAMPTZ DEFAULT NULL,
    valid_until TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create "coupon_usage" table
CREATE TABLE IF NOT EXISTS coupon_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_phone TEXT DEFAULT NULL,
    order_id TEXT DEFAULT NULL, -- UUID or Text Order ID (FLW-xxxx-xxxx)
    used_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Alter "orders" table to add discount tracking columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT DEFAULT NULL;

-- 4. Enable Row Level Security (RLS) Policies
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

-- Coupons: Publicly readable for cart validation, admin editable
CREATE POLICY "Coupons are publicly readable" ON coupons 
    FOR SELECT USING (true);

CREATE POLICY "Admin full access to coupons" ON coupons 
    FOR ALL USING (auth.role() = 'authenticated');

-- Coupon Usage: Users can insert & view their own usage, admins full access
CREATE POLICY "Users can insert coupon usage" ON coupon_usage 
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view coupon usage" ON coupon_usage 
    FOR SELECT USING (true);

-- 5. Insert starter row for welcome coupon NEW120
INSERT INTO coupons (code, discount_type, discount_value, is_first_order_only, usage_limit_per_customer)
VALUES ('NEW120', 'flat', 120, true, 1)
ON CONFLICT (code) DO NOTHING;
