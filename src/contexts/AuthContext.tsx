import React, { createContext, useContext, useEffect, useState } from 'react';
import { decodeBase64Json } from '../utils/jwtUtils';
import api from '../services/api';

interface AuthState {
  token: string | null;
  username: string | null;
  perms: string[];
}

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'app_token';

function parseToken(token: string | null): { username: string | null; perms: string[] } {
  if (!token) return { username: null, perms: [] };
  try {
    const parts = token.split('.');
    if (parts.length < 2) return { username: null, perms: [] };
    const payload = decodeBase64Json(parts[1]);
    const username = payload.sub ?? null;
    const perms = Array.isArray(payload.perms) ? payload.perms : [];
    return { username, perms };
  } catch (e) {
    return { username: null, perms: [] };
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [username, setUsername] = useState<string | null>(null);
  const [perms, setPerms] = useState<string[]>([]);

  useEffect(() => {
    const { username: u, perms: p } = parseToken(token);
    setUsername(u);
    setPerms(p);
  }, [token]);

  const login = async (usernameIn: string, password: string) => {
    const resp = await api.post('/auth/login', { username: usernameIn, password });
    const maybeToken = resp.data?.token ?? resp.data?.accessToken ?? resp.data;
    if (!maybeToken || typeof maybeToken !== 'string') throw new Error('Token not returned');
    localStorage.setItem(TOKEN_KEY, maybeToken);
    setToken(maybeToken);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUsername(null);
    setPerms([]);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, username, perms, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
