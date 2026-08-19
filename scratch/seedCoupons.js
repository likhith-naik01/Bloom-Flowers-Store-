const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data.json');
let data = {};
if (fs.existsSync(dataPath)) {
  data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
}

const initialCoupons = [
  {
    id: "c_new120",
    code: "NEW120",
    discount_type: "flat",
    discount_value: 120,
    min_order_value: 0,
    max_discount_amount: null,
    is_first_order_only: true,
    is_active: true,
    usage_limit_per_customer: 1,
    valid_from: null,
    valid_until: null,
    created_at: new Date().toISOString()
  },
  {
    id: "c_fest20",
    code: "FEST20",
    discount_type: "percentage",
    discount_value: 20,
    min_order_value: 300,
    max_discount_amount: 2000,
    is_first_order_only: false,
    is_active: true,
    usage_limit_per_customer: 5,
    valid_from: null,
    valid_until: null,
    created_at: new Date().toISOString()
  },
  {
    id: "c_bloom50",
    code: "BLOOM50",
    discount_type: "flat",
    discount_value: 50,
    min_order_value: 250,
    max_discount_amount: null,
    is_first_order_only: false,
    is_active: true,
    usage_limit_per_customer: 3,
    valid_from: null,
    valid_until: null,
    created_at: new Date().toISOString()
  }
];

// Merge coupons ensuring code uniqueness
const existingCodes = new Set((data.coupons || []).map(c => c.code));
const merged = [...(data.coupons || [])];

initialCoupons.forEach(c => {
  if (!existingCodes.has(c.code)) {
    merged.push(c);
  }
});

data.coupons = merged;
data.coupon_usage = data.coupon_usage || [];

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
console.log('Successfully updated coupons list in data.json!');
