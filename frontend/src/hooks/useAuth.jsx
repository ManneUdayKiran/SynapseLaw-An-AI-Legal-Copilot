import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

const GUEST_USER = { id: 'guest-user-00000000000000000000', full_name: 'Guest User', email: 'guest@lexiguide.com' };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(GUEST_USER);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data || GUEST_USER);
      } catch {
        setUser(GUEST_USER);
      }
    }
    loadUser();
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    async login(email, password) {
      const { data } = await api.post('/auth/login', { email, password });
      if (data?.access_token) window.localStorage.setItem('lexiguide_token', data.access_token);
      setUser(data?.user || GUEST_USER);
    },
    async register(payload) {
      const { data } = await api.post('/auth/register', payload);
      if (data?.access_token) window.localStorage.setItem('lexiguide_token', data.access_token);
      setUser(data?.user || GUEST_USER);
    },
    logout() {
      window.localStorage.removeItem('lexiguide_token');
      setUser(GUEST_USER);
    }
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
