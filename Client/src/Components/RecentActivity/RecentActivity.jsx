import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './RecentActivity.css';

const RecentActivity = () => {
  const { user, isAdmin } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadActivities = async () => {
    try {
      setLoading(true);

      let url = '';

      if (isAdmin) {
        url = `/api/activities?isAdmin=true`; // fetch all (admin)
      } else if (user?.username) {
        url = `/api/activities?userId=${user.username}`; // fetch user-specific
      } else {
        console.warn('User not logged in');
        setLoading(false);
        return;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch activities');
      }

      // If backend returns wrapped object: { success, data, total }
      const allActivities = data.data || data;

      // Sort (newest first) and slice top 15
      const sortedActivities = allActivities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 15);

      setActivities(sortedActivities);
    } catch (err) {
      console.error('Error loading activities:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();

    // Listen for activity updates
    const handleActivityUpdate = () => {
      loadActivities();
    };

    window.addEventListener('activityUpdate', handleActivityUpdate);
    return () => window.removeEventListener('activityUpdate', handleActivityUpdate);
  }, [isAdmin]);



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
      system: '🖥️',
      download: '📥',
      chart_view: '📈',
      data_process: '⚡'
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
      system: '#a29bfe',
      download: '#00b894',
      chart_view: '#e17055',
      data_process: '#6c5ce7'
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
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return time.toLocaleDateString();
  };

  const refreshActivities = () => {
    loadActivities();
  };

  const clearActivities = async () => {
    const confirmClear = window.confirm('Are you sure you want to clear all activities?');
    if (!confirmClear) return;

    try {
      let url = '/api/activities';
      let method = 'DELETE';
      let body = {};

      if (!isAdmin && user?.username) {
        body.userId = user.username; // send userId to clear only user's activities
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: isAdmin ? null : JSON.stringify(body), // admin sends no body
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to clear activities');
      }

      setActivities([]);
      alert('Activities cleared successfully ✅');
    } catch (error) {
      console.error('Clear Activities Error:', error.message);
      alert('❌ Failed to clear activities');
    }
  };


  const exportActivities = () => {
    const dataStr = JSON.stringify(activities, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-log-${user?.username}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    addActivity('export', 'Exported activity log', 'Downloaded as JSON file');
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
        <h3>🕒 Activity Log</h3>
        <div className="activity-controls">
          <button className="control-btn" onClick={refreshActivities} title="Refresh">
            🔄
          </button>
          <button className="control-btn" onClick={exportActivities} title="Export">
            📤
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

// Enhanced helper function to send activity to backend
export const addActivity = async (type, description, details = null) => {
  try {
    const token = JSON.parse(localStorage.getItem('token'));
    if (!token || !token.username) return;

    const activity = {
      id: Date.now() + Math.random(),         // frontend-generated ID
      type,
      description,
      details,
      userId: token.username,
      timestamp: new Date().toISOString(),
    };

    const res = await fetch('/api/activities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 🔐 Optional: Add JWT auth header if you’re securing routes
        // 'Authorization': `Bearer ${token.accessToken}`
      },
      body: JSON.stringify(activity),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to add activity');
    }

    // ✅ Optional: Notify app to reload logs from server
    window.dispatchEvent(new CustomEvent('activityUpdate'));
  } catch (err) {
    console.error('Failed to add activity:', err.message);
  }
};

export default RecentActivity;