import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, showConnectionStatus } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check backend connection
      const connectionStatus = await showConnectionStatus();
      setBackendConnected(connectionStatus.connected);

      // Try to restore user session
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = JSON.parse(token);
          console.log('Restoring user session:', userData);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing stored token:', error);
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      console.log('Login attempt:', credentials);

      if (backendConnected) {
        // Use backend authentication
        const response = await apiClient.login(credentials);
        if (response.success) {
          const userData = {
            id: response.user.id,
            username: response.user.username,
            email: response.user.email,
            role: response.user.role || credentials.role,
            token: response.token
          };
          setUser(userData);
          localStorage.setItem('token', JSON.stringify(userData));
          return { success: true };
        } else {
          return { success: false, message: response.message };
        }
      } else {
        // Fallback to local storage authentication
        const users = JSON.parse(localStorage.getItem('users')) || [];
        console.log('Available users:', users);
        console.log('Looking for user with credentials:', credentials);

        const user = users.find(u => {
          const usernameMatch = u.username === credentials.username;
          const passwordMatch = u.password === credentials.password;
          const roleMatch = u.role === credentials.role;

          console.log(`Checking user ${u.username}:`, {
            usernameMatch,
            passwordMatch,
            roleMatch,
            userRole: u.role,
            expectedRole: credentials.role
          });

          return usernameMatch && passwordMatch && roleMatch;
        });

        if (user) {
          const userData = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
          };
          console.log('Login successful:', userData);
          setUser(userData);
          localStorage.setItem('token', JSON.stringify(userData));
          return { success: true };
        } else {
          console.log('Login failed: No matching user found');
          return {
            success: false,
            message: 'Invalid username, password, or role. Please check your credentials.'
          };
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message || 'Login failed. Please try again.' };
    }
  };

  const register = async (userData) => {
    try {
      console.log('Registration attempt:', userData);

      if (backendConnected) {
        // Use backend registration
        const response = await apiClient.register(userData);
        return response;
      } else {
        // Fallback to local storage registration
        const users = JSON.parse(localStorage.getItem('users')) || [];

        if (users.find(u => u.username === userData.username)) {
          return { success: false, message: 'Username already exists' };
        }

        if (users.find(u => u.email === userData.email)) {
          return { success: false, message: 'Email already exists' };
        }

        const newUser = {
          id: Date.now(),
          ...userData,
          createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        console.log('Registration successful:', newUser);
        return { success: true, message: 'Registration successful' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: error.message || 'Registration failed. Please try again.' };
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};