import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [orderNote, setOrderNote] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('flower_shop_cart');
      const savedNote = localStorage.getItem('flower_shop_note');
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedNote) setOrderNote(savedNote);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('flower_shop_cart', JSON.stringify(cart));
      localStorage.setItem('flower_shop_note', orderNote);
    } catch (e) {
      console.error(e);
    }
  }, [cart, orderNote]);

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

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setOrderNote('');
  };

  const getItemEffectivePrice = (item) => {
    let finalPrice = item.price;
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

  return (
    <CartContext.Provider
      value={{
        cart,
        orderNote,
        setOrderNote,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
        getItemEffectivePrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
