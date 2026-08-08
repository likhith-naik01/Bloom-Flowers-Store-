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
  const audioCtxRef = useRef(null);

  // Initialize & Unlock AudioContext on first user interaction (bypasses browser autoplay blocks)
  const initAudio = () => {
    try {
      if (!audioCtxRef.current && typeof window !== 'undefined') {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    } catch (e) {
      console.log('Audio init error:', e);
    }
  };

  useEffect(() => {
    const unlockAudio = () => {
      initAudio();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  // Web Audio Synthesized 2-Tone Bell Chime ("Ding-Dong!" 🔔)
  const playOrderChime = () => {
    try {
      initAudio();
      const ctx = audioCtxRef.current || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Bell Tone 1: E5 (659.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.5, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Bell Tone 2: A5 (880.00 Hz) - High Chime 0.15s later
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, now + 0.15);
      gain2.gain.setValueAtTime(0.6, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.75);

      // Mobile Device Physical Vibration
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([250, 100, 250]);
      }
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
          icon: '/favicon.ico',
          vibrate: [250, 100, 250]
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
      const isAdminSession =
        typeof window !== 'undefined' && localStorage.getItem('flower_shop_admin') === 'true';

      const fetchPromises = [
        fetch('/api/categories'),
        fetch('/api/products'),
        fetch('/api/banner')
      ];

      // Fetch orders for admin or initial setup
      if (isAdminSession || !initialFetchDone.current) {
        fetchPromises.push(fetch('/api/orders'));
      }

      const results = await Promise.all(fetchPromises);
      const catRes = results[0];
      const prodRes = results[1];
      const banRes = results[2];
      const ordRes = results[3];

      if (catRes && catRes.ok) setCategories(await catRes.json());
      if (prodRes && prodRes.ok) setProducts(await prodRes.json());
      if (banRes && banRes.ok) setBanners(await banRes.json());
      
      if (ordRes && ordRes.ok) {
        const fetchedOrders = await ordRes.json();
        setOrders(fetchedOrders);

        if (!initialFetchDone.current) {
          // On first load, record all existing order IDs as already notified so they don't chime
          fetchedOrders.forEach((o) => notifiedOrderIdsRef.current.add(o.id));
          initialFetchDone.current = true;
        } else if (isAdminSession) {
          // Find newly arrived orders that have NEVER been chimed for (ADMIN ONLY)
          const unnotifiedNewOrders = fetchedOrders.filter(
            (o) => o.status === 'new' && !notifiedOrderIdsRef.current.has(o.id)
          );

          if (unnotifiedNewOrders.length > 0) {
            unnotifiedNewOrders.forEach((newOrd) => {
              notifiedOrderIdsRef.current.add(newOrd.id); // Mark immediately as notified
              setNewOrderAlert(newOrd);
              playOrderChime(); // Single 1-time chime sound ONLY for logged-in Admin!
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
