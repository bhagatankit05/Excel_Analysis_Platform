import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, showConnectionStatus } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

const hashPassword = async (text) => {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return btoa(text);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendConnected, setBackendConn] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const status = await showConnectionStatus();
      setBackendConn(status.connected);

      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = JSON.parse(token);
          console.log('Restoring user session:', userData);
          setUser(userData);
        } catch (err) {
          console.error('Error parsing stored token:', err);
          localStorage.removeItem('token');
        }
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      console.log('Login attempt:', { ...credentials, password: '••••' });
      console.log('Encrypted password:', await hashPassword(credentials.password));

      if (backendConnected) {
        const res = await apiClient.login(credentials);
        if (res.success) {
          const userData = {
            id: res.user.id,
            username: res.user.username,
            email: res.user.email,
            role: res.user.role || credentials.role,
            token: res.token
          };
          setUser(userData);
          localStorage.setItem('token', JSON.stringify(userData));
          return { success: true };
        }
        return { success: false, message: res.message };
      }

      const users = JSON.parse(localStorage.getItem('users')) || [];
      const found = users.find(
        u =>
          u.username === credentials.username &&
          u.password === credentials.password &&
          u.role === credentials.role
      );

      if (found) {
        const userData = {
          id: found.id,
          username: found.username,
          email: found.email,
          role: found.role
        };
        setUser(userData);
        localStorage.setItem('token', JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, message: 'Invalid username, password, or role.' };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: err.message || 'Login failed.' };
    }
  };

  const register = async (data) => {
    try {
      console.log('Registration attempt:', { ...data, password: '••••' });
      console.log('Encrypted password:', await hashPassword(data.password));

      if (backendConnected) {
        return await apiClient.register(data);
      }

      const users = JSON.parse(localStorage.getItem('users')) || [];
      if (users.find(u => u.username === data.username))
        return { success: false, message: 'Username already exists' };
      if (users.find(u => u.email === data.email))
        return { success: false, message: 'Email already exists' };

      const newUser = { id: Date.now(), ...data, createdAt: new Date().toISOString() };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      return { success: true, message: 'Registration successful' };
    } catch (err) {
      console.error('Registration error:', err);
      return { success: false, message: err.message || 'Registration failed.' };
    }
  };

  const logout = () => {
    console.log('Logging out user:', user);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('chartData');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    backendConnected,
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
