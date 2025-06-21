import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addActivity } from '../../components/RecentActivity/RecentActivity';
import './ActivityLog.css';

const ActivityLog = () => {
  const { user, isAdmin } = useAuth();
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const activityTypes = [
    { id: 'all', name: 'All Activities', icon: '📋' },
    { id: 'upload', name: 'File Uploads', icon: '📤' },
    { id: 'analysis', name: 'Data Analysis', icon: '🔍' },
    { id: 'report', name: 'Reports', icon: '📊' },
    { id: 'login', name: 'Login Events', icon: '🔐' },
    { id: 'logout', name: 'Logout Events', icon: '🚪' },
    { id: 'ai_insight', name: 'AI Insights', icon: '🧠' },
    { id: 'export', name: 'Exports', icon: '📄' },
    { id: 'settings', name: 'Settings', icon: '⚙️' },
    { id: 'user_created', name: 'User Management', icon: '👤' },
    { id: 'system', name: 'System Events', icon: '🖥️' }
  ];

  const dateFilters = [
    { id: 'all', name: 'All Time' },
    { id: 'today', name: 'Today' },
    { id: 'week', name: 'This Week' },
    { id: 'month', name: 'This Month' },
    { id: 'quarter', name: 'This Quarter' }
  ];

  useEffect(() => {
    loadActivities();
  }, [isAdmin]);

  useEffect(() => {
    filterAndSortActivities();
  }, [activities, filterType, filterDate, searchTerm, sortBy, sortOrder]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadActivities = async () => {
  try {
    let url = '';

    if (isAdmin) {
      url = `/api/activities?isAdmin=true`; // 🔐 ideally check admin from token, not query
    } else if (user?.username) {
      url = `/api/activities?userId=${user.username}`;
    } else {
      console.warn('User info missing.');
      return;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch activities');
    }

    setActivities(data.data || data); // `data.data` if using wrapped response
  } catch (error) {
    console.error('Error fetching activities:', error.message);
  }
};



  const filterAndSortActivities = () => {
    let filtered = [...activities];

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(activity => activity.type === filterType);
    }

    // Filter by date
    if (filterDate !== 'all') {
      const now = new Date();
      const activityDate = new Date();
      
      switch (filterDate) {
        case 'today':
          activityDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(activity => 
            new Date(activity.timestamp) >= activityDate
          );
          break;
        case 'week':
          activityDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(activity => 
            new Date(activity.timestamp) >= activityDate
          );
          break;
        case 'month':
          activityDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(activity => 
            new Date(activity.timestamp) >= activityDate
          );
          break;
        case 'quarter':
          activityDate.setMonth(now.getMonth() - 3);
          filtered = filtered.filter(activity => 
            new Date(activity.timestamp) >= activityDate
          );
          break;
      }
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.userId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort activities
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'timestamp') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredActivities(filtered);
    setCurrentPage(1);
  };

  const getActivityIcon = (type) => {
    const typeConfig = activityTypes.find(t => t.id === type);
    return typeConfig ? typeConfig.icon : '📋';
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

  const formatFullDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleActivityClick = (activity) => {
    setSelectedActivity(activity);
    setShowModal(true);
  };

  const handleDropdownToggle = (activityId, event) => {
    event.stopPropagation();
    setOpenDropdown(openDropdown === activityId ? null : activityId);
  };

  const handleViewDetails = (activity, event) => {
    event.stopPropagation();
    setOpenDropdown(null);
    handleActivityClick(activity);
  };

  const handleDeleteActivity = (activityId, event) => {
    event.stopPropagation();
    setOpenDropdown(null);
    
    if (confirm('Are you sure you want to delete this activity?')) {
      const allActivities = JSON.parse(localStorage.getItem('userActivities')) || [];
      const updatedActivities = allActivities.filter(activity => activity.id !== activityId);
      localStorage.setItem('userActivities', JSON.stringify(updatedActivities));
      
      setActivities(prev => prev.filter(activity => activity.id !== activityId));
      addActivity('system', 'Deleted activity log entry', 'Activity removed from log');
    }
  };

  const handleExportActivity = (activity, event) => {
    event.stopPropagation();
    setOpenDropdown(null);
    
    const dataStr = JSON.stringify(activity, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-${activity.id}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    addActivity('export', 'Exported single activity', 'Downloaded as JSON file');
  };

  const exportActivities = () => {
    const dataStr = JSON.stringify(filteredActivities, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-log-${user?.username}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    addActivity('export', 'Exported activity log', 'Downloaded as JSON file');
  };

  const clearActivities = () => {
    if (confirm('Are you sure you want to clear all activities? This action cannot be undone.')) {
      if (isAdmin) {
        localStorage.removeItem('userActivities');
      } else {
        const allActivities = JSON.parse(localStorage.getItem('userActivities')) || [];
        const otherUserActivities = allActivities.filter(activity => activity.userId !== user?.username);
        localStorage.setItem('userActivities', JSON.stringify(otherUserActivities));
      }
      setActivities([]);
      addActivity('system', 'Cleared activity log', 'All activities removed');
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActivities = filteredActivities.slice(startIndex, endIndex);

  const getActivityStats = () => {
    const stats = {
      total: activities.length,
      today: activities.filter(a => {
        const today = new Date();
        const activityDate = new Date(a.timestamp);
        return activityDate.toDateString() === today.toDateString();
      }).length,
      thisWeek: activities.filter(a => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(a.timestamp) >= weekAgo;
      }).length,
      byType: activityTypes.reduce((acc, type) => {
        if (type.id !== 'all') {
          acc[type.id] = activities.filter(a => a.type === type.id).length;
        }
        return acc;
      }, {})
    };
    return stats;
  };

  const stats = getActivityStats();

  return (
    <div className="activity-log">
      <div className="activity-header">
        <div className="header-content">
          <h1>📋 Activity Log</h1>
          <p>Complete history of all system activities and user interactions</p>
        </div>
        
        <div className="header-actions">
          <button className="action-btn secondary" onClick={exportActivities}>
            <span>📤</span>
            Export Log
          </button>
          {isAdmin && (
            <button className="action-btn danger" onClick={clearActivities}>
              <span>🗑️</span>
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Activities</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-number">{stats.today}</div>
            <div className="stat-label">Today</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-number">{stats.thisWeek}</div>
            <div className="stat-label">This Week</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <div className="stat-number">{Math.max(...Object.values(stats.byType))}</div>
            <div className="stat-label">Peak Activity</div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="activity-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-section">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            {activityTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.icon} {type.name}
              </option>
            ))}
          </select>
          
          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="filter-select"
          >
            {dateFilters.map(filter => (
              <option key={filter.id} value={filter.id}>
                {filter.name}
              </option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="timestamp">Date</option>
            <option value="type">Type</option>
            <option value="userId">User</option>
            <option value="description">Description</option>
          </select>
          
          <button
            className="sort-btn"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Activity List */}
      <div className="activity-list-container">
        {currentActivities.length === 0 ? (
          <div className="no-activities">
            <div className="no-activity-icon">📭</div>
            <h3>No Activities Found</h3>
            <p>No activities match your current filters. Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="activity-list">
            {currentActivities.map((activity) => (
              <div 
                key={activity.id} 
                className="activity-item"
                onClick={() => handleActivityClick(activity)}
              >
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
                  <div className="activity-main">
                    <h4 className="activity-description">{activity.description}</h4>
                    <div className="activity-meta">
                      <span className="activity-time">{formatTimeAgo(activity.timestamp)}</span>
                      {isAdmin && activity.userId && (
                        <span className="activity-user">by {activity.userId}</span>
                      )}
                      <span className="activity-type">{activity.type}</span>
                    </div>
                  </div>
                  
                  {activity.details && (
                    <div className="activity-details">
                      {activity.details}
                    </div>
                  )}
                </div>
                
                <div className="activity-actions" ref={openDropdown === activity.id ? dropdownRef : null}>
                  <button 
                    className="action-menu-btn" 
                    onClick={(e) => handleDropdownToggle(activity.id, e)}
                    title="More options"
                  >
                    ⋯
                  </button>
                  
                  {openDropdown === activity.id && (
                    <div className="action-dropdown">
                      <button 
                        className="dropdown-item"
                        onClick={(e) => handleViewDetails(activity, e)}
                      >
                        <span>👁️</span>
                        View Details
                      </button>
                      <button 
                        className="dropdown-item"
                        onClick={(e) => handleExportActivity(activity, e)}
                      >
                        <span>📤</span>
                        Export
                      </button>
                      <button 
                        className="dropdown-item danger"
                        onClick={(e) => handleDeleteActivity(activity.id, e)}
                      >
                        <span>🗑️</span>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="page-btn"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>
            
            <div className="page-info">
              <span>Page {currentPage} of {totalPages}</span>
              <span className="total-items">({filteredActivities.length} activities)</span>
            </div>
            
            <button 
              className="page-btn"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Activity Detail Modal */}
      {showModal && selectedActivity && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <span className="modal-icon">{getActivityIcon(selectedActivity.type)}</span>
                Activity Details
              </h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            
            <div className="modal-content">
              <div className="detail-group">
                <label>Description:</label>
                <p>{selectedActivity.description}</p>
              </div>
              
              <div className="detail-group">
                <label>Type:</label>
                <span className="type-badge" style={{ backgroundColor: `${getActivityColor(selectedActivity.type)}20`, color: getActivityColor(selectedActivity.type) }}>
                  {getActivityIcon(selectedActivity.type)} {selectedActivity.type}
                </span>
              </div>
              
              <div className="detail-group">
                <label>Timestamp:</label>
                <p>{formatFullDate(selectedActivity.timestamp)}</p>
              </div>
              
              {selectedActivity.userId && (
                <div className="detail-group">
                  <label>User:</label>
                  <p>{selectedActivity.userId}</p>
                </div>
              )}
              
              {selectedActivity.details && (
                <div className="detail-group">
                  <label>Additional Details:</label>
                  <p>{selectedActivity.details}</p>
                </div>
              )}
              
              <div className="detail-group">
                <label>Activity ID:</label>
                <p className="activity-id">{selectedActivity.id}</p>
              </div>
            </div>
            
            <div className="modal-actions">
              <button className="modal-btn secondary" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;