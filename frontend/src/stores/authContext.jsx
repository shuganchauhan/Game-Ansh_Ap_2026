import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import { disconnectSocket } from '../lib/socket';

// Keep the context object stable while Vite replaces this module during HMR.
// Otherwise a refreshed hook can read a new context instance while the mounted
// provider still owns the previous one, making useContext return undefined.
const AuthContext = import.meta.hot?.data?.authContext || createContext(undefined);
if (import.meta.hot) import.meta.hot.data.authContext = AuthContext;
AuthContext.displayName = 'AuthContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('gamersg_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('gamersg_token') || null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('gamersg_token', token);
    } else {
      localStorage.removeItem('gamersg_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('gamersg_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('gamersg_user');
    }
  }, [user]);

  // Clean login: just email and password (backend automatically detects role!)
  const login = async (email, password, role = undefined) => {
    const payload = { email: email.trim(), password };
    if (role) payload.role = role;
    const data = await api.post('/auth/login', payload);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  // Clean signup: just email, password, and optional username (friction-free)
  const signup = async (arg1, arg2, arg3) => {
    let route = '/auth/signup';
    let payload;

    if (typeof arg1 === 'object') {
      // signup({ email, password, username })
      payload = {
        email: arg1.email?.trim(),
        password: arg1.password,
        ...(arg1.username ? { username: arg1.username.trim() } : {}),
      };
    } else if (typeof arg2 === 'object') {
      // Legacy signature: signup('player' | 'org' | 'organizer', { email, password, ... })
      route = `/auth/signup/${arg1}`;
      payload = arg2;
    } else {
      // signup(email, password, username)
      payload = {
        email: arg1?.trim(),
        password: arg2,
        ...(arg3 ? { username: arg3.trim() } : {}),
      };
    }

    const data = await api.post(route, payload);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const updateUser = (updated) => {
    setUser((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem('gamersg_user', JSON.stringify(next));
      } catch {
        // ignore localStorage quota errors
      }
      return next;
    });
  };

  const logout = () => {
    disconnectSocket();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
}
