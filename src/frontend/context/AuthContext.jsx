import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '../../backend/supabase/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch profile details for a given user ID
  const fetchProfile = async (userId) => {
    if (!userId || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
        return data;
      } else {
        setProfile(null);
        return null;
      }
    } catch (e) {
      console.error('Error fetching profile:', e);
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    // Check initial admin state
    try {
      const storedAdmin = localStorage.getItem('flower_shop_admin');
      if (storedAdmin === 'true') {
        setIsAdmin(true);
      }
    } catch (e) {}

    // Initial Supabase Session Check
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      setLoading(false);
    }
  }, [supabase]);

  // Supabase Auth Methods
  const signUp = async (email, password) => {
    if (!supabase) return { error: { message: 'Supabase client not initialized' } };
    return await supabase.auth.signUp({
      email,
      password,
    });
  };

  const loginUser = async (email, password) => {
    if (!supabase) return { error: { message: 'Supabase client not initialized' } };
    const res = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (res.data?.user) {
      await fetchProfile(res.data.user.id);
    }
    return res;
  };

  const logoutUser = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const resetPassword = async (email) => {
    if (!supabase) return { error: { message: 'Supabase client not initialized' } };
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined,
    });
  };

  const saveProfile = async ({ full_name, phone, default_address }) => {
    if (!user || !supabase) return { error: { message: 'User not authenticated' } };

    const payload = {
      id: user.id,
      full_name,
      phone,
      ...(default_address !== undefined ? { default_address } : {}),
      created_at: profile?.created_at || new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload)
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
      return { success: true, profile: data };
    }
    return { success: false, error: error?.message || 'Failed to update profile' };
  };

  // Legacy Admin Methods
  const loginAdmin = async (username, password) => {
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

  const logoutAdmin = () => {
    setIsAdmin(false);
    localStorage.removeItem('flower_shop_admin');
  };

  const signInWithGoogle = async () => {
    if (!supabase) return { error: { message: 'Supabase client not initialized' } };
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/login`,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account'
        }
      }
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isAdmin,
        signUp,
        loginUser,
        logoutUser,
        signInWithGoogle,
        resetPassword,
        fetchProfile,
        saveProfile,
        // Legacy admin compatibility
        login: loginAdmin,
        logout: logoutAdmin,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
