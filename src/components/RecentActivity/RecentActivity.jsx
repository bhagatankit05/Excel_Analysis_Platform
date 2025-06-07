import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './RecentActivity.css';

const RecentActivity = () => {
  const { isAdmin } = useAuth();
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    // Simulate loading recent activities
    const loadActivities = () => {
      const sampleActivities = [
        {
          id: 1,
          type: 'upload',
          description: 'Sales_Data.xlsx uploaded',
          time: '2 hours ago',
          icon: '📤',
          color: '#667eea'
        },
        {
          id: 2,
          type: 'analysis',
          description: 'Data analysis completed',
          time: '4 hours ago',
          icon: '🔍',
          color: '#764ba2'
        },
        {
          id: 3,
          type: 'report',
          description: 'Monthly report generated',
          time: '1 day ago',
          icon: '📊',
          color: '#f093fb'
        },
        {
          id: 4,
          type: 'user',
          description: isAdmin ? 'New user registered' : 'Profile updated',
          time: '2 days ago',
          icon: isAdmin ? '👤' : '⚙️',
          color: '#f5576c'
        },
        {
          id: 5,
          type: 'export',
          description: 'Data exported to PDF',
          time: '3 days ago',
          icon: '📄',
          color: '#feca57'
        }
      ];
      setActivities(sampleActivities);
    };

    loadActivities();
  }, [isAdmin]);

  return (
    <div className="recent-activity">
      <div className="activity-header">
        <h3>Recent Activity</h3>
        <button className="view-all-btn">View All</button>
      </div>
      
      <div className="activity-list">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-item">
            <div 
              className="activity-icon"
              style={{ backgroundColor: `${activity.color}20`, color: activity.color }}
            >
              {activity.icon}
            </div>
            <div className="activity-content">
              <p className="activity-description">{activity.description}</p>
              <span className="activity-time">{activity.time}</span>
            </div>
            <div className="activity-action">
              <button className="action-menu">⋯</button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="activity-footer">
        <button className="refresh-btn">
          <span>🔄</span>
          Refresh
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;