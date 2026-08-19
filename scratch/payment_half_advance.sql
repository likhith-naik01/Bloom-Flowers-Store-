-- ============================================================
-- BLOOM FLOWER SHOP: HALF ADVANCE & PAYMENT TRACKING ALTER TABLE
-- ============================================================

-- 1. Add advance_amount and remaining_amount columns to "orders" table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS advance_amount NUMERIC DEFAULT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS remaining_amount NUMERIC DEFAULT NULL;

-- 2. Update payment_method & payment_status check constraints if present
-- Supported payment_method values: 'cod', 'online', 'half_advance'
-- Supported payment_status values: 'pending', 'paid', 'partially_paid', 'failed'

-- Note: 'cod' represents Cash on Confirmation in UI
-- Note: 'half_advance' represents 50% upfront via Razorpay + 50% remaining on delivery
