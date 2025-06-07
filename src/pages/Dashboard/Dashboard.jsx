import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import StatsCard from '../../components/StatsCard/StatsCard';
import ChartWidget from '../../components/ChartWidget/ChartWidget';
import RecentActivity from '../../components/RecentActivity/RecentActivity';
import './Dashboard.css';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalAnalyses: 0,
    activeUsers: 0,
    recentUploads: 0
  });

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = () => {
      const files = JSON.parse(localStorage.getItem('uploadedFiles')) || [];
      const analyses = JSON.parse(localStorage.getItem('analyses')) || [];
      const users = JSON.parse(localStorage.getItem('users')) || [];
      
      setStats({
        totalFiles: files.length,
        totalAnalyses: analyses.length,
        activeUsers: isAdmin ? users.length : 1,
        recentUploads: files.filter(f => {
          const uploadDate = new Date(f.uploadDate);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return uploadDate > weekAgo;
        }).length
      });
    };

    loadDashboardData();
  }, [isAdmin]);

  const adminStats = [
    { title: 'Total Files', value: stats.totalFiles, icon: '📁', color: '#667eea' },
    { title: 'Analyses', value: stats.totalAnalyses, icon: '📊', color: '#764ba2' },
    { title: 'Active Users', value: stats.activeUsers, icon: '👥', color: '#f093fb' },
    { title: 'Recent Uploads', value: stats.recentUploads, icon: '📤', color: '#f5576c' }
  ];

  const userStats = [
    { title: 'My Files', value: stats.totalFiles, icon: '📁', color: '#667eea' },
    { title: 'My Analyses', value: stats.totalAnalyses, icon: '📊', color: '#764ba2' },
    { title: 'This Week', value: stats.recentUploads, icon: '📈', color: '#f093fb' },
    { title: 'Total Reports', value: stats.totalAnalyses, icon: '📋', color: '#f5576c' }
  ];

  const statsToShow = isAdmin ? adminStats : userStats;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user?.username}! 👋</h1>
          <p>Here's what's happening with your data today.</p>
        </div>
        <div className="quick-actions">
          <button className="action-btn primary">
            <span>📤</span>
            Upload Excel
          </button>
          <button className="action-btn secondary">
            <span>🔍</span>
            Analyze Data
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {statsToShow.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="dashboard-content">
        <div className="charts-section">
          <ChartWidget />
        </div>
        <div className="activity-section">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;