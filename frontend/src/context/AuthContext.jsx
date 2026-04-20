import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { setAccessToken, clearAccessToken } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    try {
      const res = await api.post('/auth/refresh');
      setAccessToken(res.data.accessToken);
      setUser(res.data.user);
    } catch {
      // No valid session — stay logged out
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const register = useCallback(async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
  }, []);

  const logout = useCallback(() => {
    // Clear local auth immediately so UI responds instantly
    clearAccessToken();
    setUser(null);
    // Revoke server-side refresh token in background — don't block on it
    api.post('/auth/logout').catch(() => {});
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
