import { createContext, useContext, useEffect, useState } from 'react';
import { getMe, login as apiLogin } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = window.localStorage.getItem('auth_token');
    const storedUser = window.localStorage.getItem('auth_user');
    if (!token || !storedUser) {
      setLoading(false);
      return;
    }
    try {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
    } catch {
      window.localStorage.removeItem('auth_user');
    }
    getMe()
      .catch(() => {
        window.localStorage.removeItem('auth_token');
        window.localStorage.removeItem('auth_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = async ({ username, password }) => {
    const res = await apiLogin({ username, password });
    const { token, user: payload } = res.data;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('auth_token', token);
      window.localStorage.setItem('auth_user', JSON.stringify(payload));
    }
    setUser(payload);
    return payload;
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('auth_token');
      window.localStorage.removeItem('auth_user');
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        loading,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

