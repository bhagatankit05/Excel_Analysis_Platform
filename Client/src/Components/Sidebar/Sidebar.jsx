import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();

  const coreMenuItems = [
    { path: '/dashboard', icon: '📊', label: 'Analytics Hub', badge: 'NEW' },
    { path: '/upload', icon: '📤', label: 'Data Ingestion' },
    { path: '/ai-insights', icon: '🧠', label: 'AI Insights', badge: 'AI' }
  ];

  const analysisMenuItems = [
    { path: '/reports', icon: '📈', label: 'Smart Reports' },
    { path: '/analyze', icon: '🔍', label: 'Deep Analysis' },
    { path: '/activity-log', icon: '📋', label: 'Activity Log' }
  ];

  const adminMenuItems = [
    { path: '/users', icon: '👥', label: 'User Management' },
    { path: '/settings', icon: '⚙️', label: 'System Config' },
    { path: '/monitoring', icon: '📡', label: 'System Monitor' }
  ];

  const supportMenuItems = [
    { path: '/contact', icon: '💬', label: 'Support' },
    { path: '/about', icon: 'ℹ️', label: 'About' }
  ];

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
            <span className="user-role">
              {user?.role === 'admin' ? 'System Admin' : 'Data Analyst'}
            </span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Core Platform</div>
          {coreMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </NavLink>
          ))}
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Analysis Tools</div>
          {analysisMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </NavLink>
          ))}
        </div>

        {isAdmin && (
          <div className="nav-section">
            <div className="nav-section-title">Administration</div>
            {adminMenuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </NavLink>
            ))}
          </div>
        )}

        <div className="nav-section">
          <div className="nav-section-title">Support</div>
          {supportMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </NavLink>
          ))}
        </div>
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
