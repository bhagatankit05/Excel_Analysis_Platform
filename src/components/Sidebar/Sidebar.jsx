import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();

  const adminMenuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/upload', icon: '📤', label: 'Upload Excel' },
    { path: '/analyze', icon: '🔍', label: 'Analyze Data' },
    { path: '/reports', icon: '📈', label: 'Reports' },
    { path: '/users', icon: '👥', label: 'User Management' },
    { path: '/settings', icon: '⚙️', label: 'Settings' },
    { path: '/insights', icon: '💡', label: 'AI Insights' }
  ];

  const userMenuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/upload', icon: '📤', label: 'Upload Excel' },
    { path: '/analyze', icon: '🔍', label: 'Analyze Data' },
    { path: '/reports', icon: '📈', label: 'My Reports' },
    { path: '/history', icon: '📋', label: 'History' }
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">📊</span>
          <span className="logo-text">Excel Analyzer</span>
        </div>
        <div className="user-info">
          <div className="user-avatar">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <span className="username">{user?.username}</span>
            <span className="user-role">{user?.role}</span>
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