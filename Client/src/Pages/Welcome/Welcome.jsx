import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

const Welcome = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    "Real-time Data Processing",
    "AI-Powered Insights",
    "Advanced Analytics Engine",
    "Machine Learning Models",
    "Predictive Analytics",
    "Data Visualization Suite"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
  };

  return (
    <div className="welcome-container">
      <div className="hero-section">
        <div className="logo-container">
          <div className="logo-icon">⚡</div>
          <h1>DataFlow Analytics</h1>
        </div>
        
        <div className="tagline">
          <p>Next-Generation Data Intelligence Platform</p>
          <div className="feature-rotator">
            <span className="feature-text">{features[currentFeature]}</span>
          </div>
        </div>

        <div className="tech-stats">
          <div className="stat-item">
            <span className="stat-number">99.9%</span>
            <span className="stat-label">Uptime</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">10TB+</span>
            <span className="stat-label">Data Processed</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">50ms</span>
            <span className="stat-label">Response Time</span>
          </div>
        </div>
      </div>

      {!role ? (
        <div className="role-selection">
          <h2>Choose Your Access Level</h2>
          <div className="role-cards">
            <div className="role-card" onClick={() => handleRoleSelect('admin')}>
              <div className="role-icon">👨‍💼</div>
              <h3>System Administrator</h3>
              <p>Full platform access with user management and system controls</p>
              <ul>
                <li>User Management</li>
                <li>System Analytics</li>
                <li>AI Model Training</li>
                <li>Advanced Settings</li>
              </ul>
            </div>
            <div className="role-card" onClick={() => handleRoleSelect('user')}>
              <div className="role-icon">👨‍💻</div>
              <h3>Data Analyst</h3>
              <p>Advanced analytics tools for data processing and insights</p>
              <ul>
                <li>Data Upload & Analysis</li>
                <li>Real-time Dashboards</li>
                <li>AI Insights</li>
                <li>Report Generation</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="auth-section">
          <div className="selected-role">
            <div className="role-badge">
              <span className="role-icon">{role === 'admin' ? '👨‍💼' : '👨‍💻'}</span>
              <span className="role-name">{role === 'admin' ? 'System Administrator' : 'Data Analyst'}</span>
            </div>
          </div>
          
          <div className="auth-buttons">
            <button className="auth-btn primary" onClick={() => navigate(`/register/${role}`)}>
              <span>🚀</span>
              Create Account
            </button>
            <button className="auth-btn secondary" onClick={() => navigate(`/login/${role}`)}>
              <span>🔐</span>
              Sign In
            </button>
          </div>
          
          <button className="change-role-btn" onClick={() => setRole(null)}>
            ← Change Access Level
          </button>
        </div>
      )}

      <div className="tech-features">
        <div className="feature-grid">
          <div className="feature-item">
            <div className="feature-icon">🧠</div>
            <h4>AI-Powered</h4>
            <p>Machine learning algorithms for intelligent data analysis</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <h4>Real-time</h4>
            <p>Live data processing with instant insights</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🔒</div>
            <h4>Secure</h4>
            <p>Enterprise-grade security and data protection</p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Welcome;