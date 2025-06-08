import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();

  const adminMenuItems = [
    { path: '/dashboard', icon: '📊', label: 'Analytics Hub' },
    { path: '/upload', icon: '📤', label: 'Data Ingestion' },
    { path: '/analyze', icon: '🔍', label: 'Deep Analysis' },
    { path: '/reports', icon: '📈', label: 'Intelligence Reports' },
    { path: '/users', icon: '👥', label: 'User Management' },
    { path: '/ai-insights', icon: '🧠', label: 'AI Insights' },
    { path: '/settings', icon: '⚙️', label: 'System Config' }
  ];

  const userMenuItems = [
    { path: '/dashboard', icon: '📊', label: 'Analytics Hub' },
    { path: '/upload', icon: '📤', label: 'Data Upload' },
    { path: '/analyze', icon: '🔍', label: 'Data Analysis' },
    { path: '/reports', icon: '📈', label: 'My Reports' },
    { path: '/ai-insights', icon: '🧠', label: 'AI Insights' },
    { path: '/history', icon: '📋', label: 'Activity Log' }
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">DataFlow Analytics</span>
        </div>
        <div className="user-info">
          <div className="user-avatar">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <span className="username">{user?.username}</span>
            <span className="user-role">{user?.role === 'admin' ? 'System Admin' : 'Data Analyst'}</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={logout}>
          <span className="nav-icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;