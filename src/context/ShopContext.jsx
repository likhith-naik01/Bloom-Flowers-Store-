import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const ShopContext = createContext();

export function ShopProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  
  const notifiedOrderIdsRef = useRef(new Set());
  const initialFetchDone = useRef(false);

  // Web Audio Synthesized Chime Sound (Zero external file dependencies)
  const playOrderChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5 note

      gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.log('Audio chime error:', e);
    }
  };

  // Browser Native Notification
  const triggerBrowserNotification = (order) => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(`🌸 New Order Received! #${order.id}`, {
          body: `Customer: ${order.customerName} | Total: ₹${order.total}`,
          icon: '/favicon.ico'
        });
      }
    }
  };

  const requestNotificationPermission = () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  };

  const fetchShopData = async () => {
    try {
      const [catRes, prodRes, banRes, ordRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/products'),
        fetch('/api/banner'),
        fetch('/api/orders')
      ]);

      if (catRes.ok) setCategories(await catRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
      if (banRes.ok) setBanners(await banRes.json());
      
      if (ordRes.ok) {
        const fetchedOrders = await ordRes.json();
        setOrders(fetchedOrders);

        if (!initialFetchDone.current) {
          // On first load, record all existing order IDs as already notified so they don't chime
          fetchedOrders.forEach((o) => notifiedOrderIdsRef.current.add(o.id));
          initialFetchDone.current = true;
        } else {
          // Find newly arrived orders that have NEVER been chimed for
          const unnotifiedNewOrders = fetchedOrders.filter(
            (o) => o.status === 'new' && !notifiedOrderIdsRef.current.has(o.id)
          );

          if (unnotifiedNewOrders.length > 0) {
            unnotifiedNewOrders.forEach((newOrd) => {
              notifiedOrderIdsRef.current.add(newOrd.id); // Mark immediately as notified
              setNewOrderAlert(newOrd);
              playOrderChime(); // Single 1-time chime sound!
              triggerBrowserNotification(newOrd);
            });
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch shop data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopData();
    
    // Auto-poll every 4 seconds for immediate order notifications
    const interval = setInterval(() => {
      fetchShopData();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const refreshData = () => fetchShopData();

  return (
    <ShopContext.Provider
      value={{
        categories,
        products,
        banners,
        orders,
        loading,
        newOrderAlert,
        dismissAlert: () => setNewOrderAlert(null),
        playOrderChime,
        requestNotificationPermission,
        refreshData
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  return useContext(ShopContext);
}
