import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext();

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

  // Clean signup: just email and password (friction-free)
  const signup = async (emailOrType, payloadOrPassword) => {
    let payload;
    if (typeof payloadOrPassword === 'object') {
      // Legacy signature signup(type, payload)
      const route = `/auth/signup/${emailOrType}`;
      const data = await api.post(route, payloadOrPassword);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } else {
      // Pure signature signup(email, password)
      payload = { email: emailOrType.trim(), password: payloadOrPassword };
      const data = await api.post('/auth/signup', payload);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
