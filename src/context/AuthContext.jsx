import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedSession = localStorage.getItem('flower_shop_admin');
      if (storedSession === 'true') {
        setIsAdmin(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setIsAdmin(true);
      localStorage.setItem('flower_shop_admin', 'true');
      return { success: true };
    }
    return { success: false, error: data.error || 'Invalid credentials' };
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem('flower_shop_admin');
  };

  return (
    <AuthContext.Provider value={{ isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
