-- ============================================================
-- BLOOM FLOWER SHOP: PAY AFTER CONFIRMATION & PAYMENT LINKS MIGRATION
-- ============================================================

-- 1. Ensure advance_amount, remaining_amount, payment_link, and payment_link_id columns exist on "orders"
ALTER TABLE orders ADD COLUMN IF NOT EXISTS advance_amount NUMERIC DEFAULT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS remaining_amount NUMERIC DEFAULT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_link TEXT DEFAULT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_link_id TEXT DEFAULT NULL;

-- 2. payment_method supports: 'online', 'half_advance', 'pay_later', 'cod'
-- 3. payment_status supports: 'pending', 'paid', 'partially_paid', 'failed'
