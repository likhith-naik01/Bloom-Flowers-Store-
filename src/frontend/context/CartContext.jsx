import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [orderNote, setOrderNote] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('flower_shop_cart');
      const savedNote = localStorage.getItem('flower_shop_note');
      const savedCoupon = localStorage.getItem('flower_shop_coupon');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
      if (savedNote) setOrderNote(savedNote);
      if (savedCoupon) setAppliedCoupon(JSON.parse(savedCoupon));
    } catch (e) {
      console.error('Error reading cart from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('flower_shop_cart', JSON.stringify(cart));
      localStorage.setItem('flower_shop_note', orderNote);
      if (appliedCoupon) {
        localStorage.setItem('flower_shop_coupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('flower_shop_coupon');
      }
    } catch (e) {
      console.error('Error saving cart to localStorage', e);
    }
  }, [cart, orderNote, appliedCoupon, isLoaded]);

  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const getItemQuantity = (productId) => {
    const item = cart.find((i) => i.id === productId);
    return item ? item.quantity : 0;
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setOrderNote('');
    setAppliedCoupon(null);
    try {
      localStorage.removeItem('flower_shop_cart');
      localStorage.removeItem('flower_shop_note');
      localStorage.removeItem('flower_shop_coupon');
    } catch (e) {
      console.error(e);
    }
  };

  const getItemEffectivePrice = (item) => {
    let finalPrice = item.price || 0;
    if (item.discountType === 'percent' && item.discountValue > 0) {
      finalPrice = item.price * (1 - item.discountValue / 100);
    } else if (item.discountType === 'flat' && item.discountValue > 0) {
      finalPrice = Math.max(0, item.price - item.discountValue);
    }
    return Math.round(finalPrice);
  };

  const cartTotal = cart.reduce((sum, item) => {
    return sum + getItemEffectivePrice(item) * item.quantity;
  }, 0);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate dynamic coupon discount amount
  let discountAmount = 0;
  if (appliedCoupon) {
    const numValue = Number(appliedCoupon.discountValue || 0);
    if (appliedCoupon.discountType === 'flat') {
      discountAmount = Math.min(numValue, cartTotal);
    } else if (appliedCoupon.discountType === 'percentage') {
      discountAmount = (cartTotal * numValue) / 100;
      if (appliedCoupon.maxDiscountAmount && discountAmount > Number(appliedCoupon.maxDiscountAmount)) {
        discountAmount = Number(appliedCoupon.maxDiscountAmount);
      }
      discountAmount = Math.min(discountAmount, cartTotal);
    }
    discountAmount = Math.round(discountAmount);
  }

  const discountedTotal = Math.max(0, cartTotal - discountAmount);

  const applyCoupon = async ({ code, customerPhone, userId }) => {
    if (!code) return { success: false, error: 'Please enter a coupon code.' };
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, customerPhone, userId, cartTotal })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        const couponObj = {
          code: data.code,
          discountAmount: data.discountAmount,
          discountType: data.discountType,
          discountValue: data.discountValue,
          maxDiscountAmount: data.coupon?.max_discount_amount,
          coupon: data.coupon
        };
        setAppliedCoupon(couponObj);
        return { success: true, coupon: couponObj };
      } else {
        return { success: false, error: data.error || 'Invalid coupon code.' };
      }
    } catch (e) {
      console.error(e);
      return { success: false, error: 'Failed to validate coupon code.' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        orderNote,
        setOrderNote,
        addToCart,
        updateQuantity,
        getItemQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
        getItemEffectivePrice,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        discountAmount,
        discountedTotal,
        isLoaded
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
