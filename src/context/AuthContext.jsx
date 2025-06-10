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
    createDemoUsers(); // Create demo users for testing
  }, []);

  const createDemoUsers = () => {
    const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if demo users already exist
    const hasAdmin = existingUsers.find(u => u.username === 'admin');
    const hasUser = existingUsers.find(u => u.username === 'user');
    
    if (!hasAdmin || !hasUser) {
      const demoUsers = [
        {
          username: 'admin',
          email: 'admin@dataflow.com',
          password: 'admin123',
          role: 'admin',
          createdAt: new Date().toISOString()
        },
        {
          username: 'user',
          email: 'user@dataflow.com',
          password: 'user123',
          role: 'user',
          createdAt: new Date().toISOString()
        }
      ];
      
      // Add demo users if they don't exist
      demoUsers.forEach(demoUser => {
        if (!existingUsers.find(u => u.username === demoUser.username)) {
          existingUsers.push(demoUser);
        }
      });
      
      localStorage.setItem('users', JSON.stringify(existingUsers));
    }
  };

  const initializeAuth = async () => {
    // Check backend connection
    const connectionStatus = await showConnectionStatus();
    setBackendConnected(connectionStatus.connected);

    // Try to restore user session
    const token = localStorage.getItem('token');
    if (token) {
      try {
        if (connectionStatus.connected) {
          // Try to verify token with backend
          const response = await apiClient.verifyToken();
          if (response.success) {
            setUser(response.user);
          } else {
            localStorage.removeItem('token');
          }
        } else {
          // Fallback to local storage
          const userData = JSON.parse(token);
          setUser(userData);
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    try {
      if (backendConnected) {
        // Use backend authentication
        const response = await apiClient.login(credentials);
        if (response.success) {
          const userData = {
            username: response.user.username,
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
        const user = users.find(u => 
          u.username === credentials.username && 
          u.password === credentials.password && 
          u.role === credentials.role
        );

        if (user) {
          const userData = {
            username: user.username,
            role: user.role,
            email: user.email
          };
          setUser(userData);
          localStorage.setItem('token', JSON.stringify(userData));
          return { success: true };
        } else {
          return { success: false, message: 'Invalid credentials or role mismatch' };
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    }
  };

  const register = async (userData) => {
    try {
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

        users.push({
          ...userData,
          createdAt: new Date().toISOString()
        });
        
        localStorage.setItem('users', JSON.stringify(users));
        return { success: true, message: 'Registration successful' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
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