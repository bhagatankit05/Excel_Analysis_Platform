import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './RecentActivity.css';

const RecentActivity = () => {
  const { user, isAdmin } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadActivities();
    
    // Listen for activity updates
    const handleActivityUpdate = () => {
      loadActivities();
    };

    window.addEventListener('activityUpdate', handleActivityUpdate);
    return () => window.removeEventListener('activityUpdate', handleActivityUpdate);
  }, [isAdmin]);

  const loadActivities = () => {
    setLoading(true);
    
    // Get activities from localStorage
    const storedActivities = JSON.parse(localStorage.getItem('userActivities')) || [];
    
    // Filter activities based on user role
    const filteredActivities = isAdmin 
      ? storedActivities 
      : storedActivities.filter(activity => activity.userId === user?.username);
    
    // Sort by timestamp (newest first)
    const sortedActivities = filteredActivities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10); // Show only last 10 activities
    
    setActivities(sortedActivities);
    setLoading(false);
  };

  const getActivityIcon = (type) => {
    const icons = {
      upload: '📤',
      analysis: '🔍',
      report: '📊',
      login: '🔐',
      logout: '🚪',
      settings: '⚙️',
      ai_insight: '🧠',
      export: '📄',
      delete: '🗑️',
      user_created: '👤',
      system: '🖥️'
    };
    return icons[type] || '📋';
  };

  const getActivityColor = (type) => {
    const colors = {
      upload: '#667eea',
      analysis: '#764ba2',
      report: '#f093fb',
      login: '#48bb78',
      logout: '#f5576c',
      settings: '#feca57',
      ai_insight: '#ff6b6b',
      export: '#4ecdc4',
      delete: '#ff7675',
      user_created: '#74b9ff',
      system: '#a29bfe'
    };
    return colors[type] || '#718096';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const refreshActivities = () => {
    loadActivities();
  };

  const clearActivities = () => {
    if (confirm('Are you sure you want to clear all activities?')) {
      if (isAdmin) {
        localStorage.removeItem('userActivities');
      } else {
        const allActivities = JSON.parse(localStorage.getItem('userActivities')) || [];
        const otherUserActivities = allActivities.filter(activity => activity.userId !== user?.username);
        localStorage.setItem('userActivities', JSON.stringify(otherUserActivities));
      }
      setActivities([]);
    }
  };

  if (loading) {
    return (
      <div className="recent-activity">
        <div className="activity-header">
          <h3>Recent Activity</h3>
        </div>
        <div className="activity-loading">
          <div className="loading-spinner"></div>
          <span>Loading activities...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-activity">
      <div className="activity-header">
        <h3>🕒 Real-time Activity</h3>
        <div className="activity-controls">
          <button className="control-btn" onClick={refreshActivities} title="Refresh">
            🔄
          </button>
          {isAdmin && (
            <button className="control-btn danger" onClick={clearActivities} title="Clear All">
              🗑️
            </button>
          )}
        </div>
      </div>
      
      <div className="activity-list">
        {activities.length === 0 ? (
          <div className="no-activities">
            <div className="no-activity-icon">📭</div>
            <p>No recent activities</p>
            <span>Activities will appear here as you use the platform</span>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div 
                className="activity-icon"
                style={{ 
                  backgroundColor: `${getActivityColor(activity.type)}20`, 
                  color: getActivityColor(activity.type) 
                }}
              >
                {getActivityIcon(activity.type)}
              </div>
              <div className="activity-content">
                <p className="activity-description">{activity.description}</p>
                <div className="activity-meta">
                  <span className="activity-time">{formatTimeAgo(activity.timestamp)}</span>
                  {isAdmin && activity.userId && (
                    <span className="activity-user">by {activity.userId}</span>
                  )}
                  {activity.details && (
                    <span className="activity-details">{activity.details}</span>
                  )}
                </div>
              </div>
              <div className="activity-action">
                <button className="action-menu" title="More options">⋯</button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="activity-footer">
        <button className="refresh-btn" onClick={refreshActivities}>
          <span>🔄</span>
          Refresh Activities
        </button>
      </div>
    </div>
  );
};

// Helper function to add activity (can be called from other components)
export const addActivity = (type, description, details = null) => {
  const user = JSON.parse(localStorage.getItem('token'));
  if (!user) return;

  const activity = {
    id: Date.now() + Math.random(),
    type,
    description,
    details,
    userId: user.username,
    timestamp: new Date().toISOString()
  };

  const activities = JSON.parse(localStorage.getItem('userActivities')) || [];
  activities.push(activity);
  
  // Keep only last 100 activities to prevent storage bloat
  if (activities.length > 100) {
    activities.splice(0, activities.length - 100);
  }
  
  localStorage.setItem('userActivities', JSON.stringify(activities));
  
  // Dispatch custom event to update UI
  window.dispatchEvent(new CustomEvent('activityUpdate'));
};

export default RecentActivity;