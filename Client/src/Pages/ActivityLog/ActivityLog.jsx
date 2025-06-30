import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addActivity } from '../../Components/RecentActivity/RecentActivity';
import './ActivityLog.css';
import apiClient from '../../utils/api';

const ActivityLog = () => {
  const { user, isAdmin } = useAuth();

  const [activities,         setActivities]         = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [filterType,         setFilterType]         = useState('all');
  const [filterDate,         setFilterDate]         = useState('all');
  const [searchTerm,         setSearchTerm]         = useState('');
  const [sortBy,             setSortBy]             = useState('timestamp');
  const [sortOrder,          setSortOrder]          = useState('desc');
  const [selectedActivity,   setSelectedActivity]   = useState(null);
  const [showModal,          setShowModal]          = useState(false);
  const [currentPage,        setCurrentPage]        = useState(1);
  const [itemsPerPage]                              = useState(20);
  const [openDropdown,       setOpenDropdown]       = useState(null);

  const dropdownRef = useRef(null);

  /* ---------------- helper: id / timestamp safely ---------------- */
  const getId        = (a) => a.id        || a._id;
  const getTimestamp = (a) => a.timestamp || a.createdAt || a.date;

  /* ---------------- activity + date filter configs --------------- */
  const activityTypes = [
    { id: 'all',        icon: '📋', name: 'All Activities' },
    { id: 'upload',     icon: '📤', name: 'File Uploads'   },
    { id: 'analysis',   icon: '🔍', name: 'Data Analysis'  },
    { id: 'report',     icon: '📊', name: 'Reports'        },
    { id: 'login',      icon: '🔐', name: 'Login Events'   },
    { id: 'logout',     icon: '🚪', name: 'Logout Events'  },
    { id: 'ai_insight', icon: '🧠', name: 'AI Insights'    },
    { id: 'export',     icon: '📄', name: 'Exports'        },
    { id: 'settings',   icon: '⚙️', name: 'Settings'       },
    { id: 'user_created', icon: '👤', name: 'User Management' },
    { id: 'system',     icon: '🖥️', name: 'System Events' }
  ];

  const dateFilters = [
    { id: 'all',     name: 'All Time'   },
    { id: 'today',   name: 'Today'      },
    { id: 'week',    name: 'This Week'  },
    { id: 'month',   name: 'This Month' },
    { id: 'quarter', name: 'This Quarter' }
  ];

  /* ---------------- fetch on mount + role change ----------------- */
  const loadActivities = async () => {
    try {
      if (!user?.username) return;
      const params = isAdmin ? { isAdmin: true } : { userId: user.username };
      const res    = await apiClient.getActivities(params);
      setActivities(res.data || res);
    } catch (err) {
      console.error('Error fetching activities:', err.message);
    }
  };

  useEffect(() => { loadActivities(); }, [isAdmin]);

  /* ---------------- filter + sort whenever dependencies change ---- */
  useEffect(() => {
    let filtered = [...activities];

    if (filterType !== 'all')
      filtered = filtered.filter(a => a.type === filterType);

    if (filterDate !== 'all') {
      const now = new Date();
      const floor = new Date();

      switch (filterDate) {
        case 'today':   floor.setHours(0,0,0,0);             break;
        case 'week':    floor.setDate(now.getDate() - 7);    break;
        case 'month':   floor.setMonth(now.getMonth() - 1);  break;
        case 'quarter': floor.setMonth(now.getMonth() - 3);  break;
      }
      filtered = filtered.filter(a => new Date(getTimestamp(a)) >= floor);
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        (a.description || '').toLowerCase().includes(q) ||
        (a.details     || '').toLowerCase().includes(q) ||
        (a.userId      || '').toLowerCase().includes(q)
      );
    }

    filtered.sort((a, b) => {
      let av = sortBy === 'timestamp' ? new Date(getTimestamp(a)) : a[sortBy];
      let bv = sortBy === 'timestamp' ? new Date(getTimestamp(b)) : b[sortBy];
      return sortOrder === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

    setFilteredActivities(filtered);
    setCurrentPage(1);
  }, [activities, filterType, filterDate, searchTerm, sortBy, sortOrder]);

  /* ---------------- click‑outside for dropdown ------------------- */
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setOpenDropdown(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  /* ---------------- helpers for ui ------------------------------- */
  const getActivityIcon   = (t) => (activityTypes.find(x => x.id === t) || {}).icon || '📋';
  const getActivityColor  = (t) => ({
    upload:'#667eea', analysis:'#764ba2', report:'#f093fb', login:'#48bb78',
    logout:'#f5576c', settings:'#feca57', ai_insight:'#ff6b6b', export:'#4ecdc4',
    delete:'#ff7675', user_created:'#74b9ff', system:'#a29bfe', download:'#00b894',
    chart_view:'#e17055', data_process:'#6c5ce7'
  }[t] || '#718096');

  const timeAgo = (ts) => {
    const s = (Date.now() - new Date(ts)) / 1000;
    if (s < 60) return 'Just now';
    if (s < 3600) return `${Math.floor(s/60)}m ago`;
    if (s < 86400) return `${Math.floor(s/3600)}h ago`;
    if (s < 604800) return `${Math.floor(s/86400)}d ago`;
    return new Date(ts).toLocaleDateString();
  };

  /* ---------------- CRUD ui handlers (unchanged) ----------------- */
  const handleActivityClick    = (a) => { setSelectedActivity(a); setShowModal(true); };
  const handleDropdownToggle   = (id,e)=>{ e.stopPropagation(); setOpenDropdown(openDropdown===id?null:id); };
  const handleViewDetails      = (a,e)=>{ e.stopPropagation(); setOpenDropdown(null); handleActivityClick(a); };

  const handleDeleteActivity = (id,e) => {
    e.stopPropagation();
    setOpenDropdown(null);
    if (!confirm('Delete this activity?')) return;
    setActivities(prev => prev.filter(a => getId(a) !== id));
    addActivity('system','Deleted activity log entry','Activity removed');
  };

  const handleExportActivity = (a,e) => {
    e.stopPropagation(); setOpenDropdown(null);
    const blob = new Blob([JSON.stringify(a,null,2)],{type:'application/json'});
    const url  = URL.createObjectURL(blob);
    const link = Object.assign(document.createElement('a'),{
      href:url, download:`activity-${getId(a)}-${new Date().toISOString().slice(0,10)}.json`
    });
    link.click(); URL.revokeObjectURL(url);
    addActivity('export','Exported single activity','Downloaded as JSON');
  };

  const exportActivities = () => {
    const blob = new Blob([JSON.stringify(filteredActivities,null,2)],{type:'application/json'});
    const url  = URL.createObjectURL(blob);
    const link = Object.assign(document.createElement('a'),{
      href:url, download:`activity-log-${user?.username}-${new Date().toISOString().slice(0,10)}.json`
    });
    link.click(); URL.revokeObjectURL(url);
    addActivity('export','Exported activity log','Downloaded as JSON');
  };

  const clearActivities = () => {
    if (!confirm('Clear ALL activities?')) return;
    setActivities([]);
    addActivity('system','Cleared activity log','All activities removed');
  };

  /* ---------------- pagination & stats --------------------------- */
  const items  = filteredActivities;
  const pages  = Math.ceil(items.length / itemsPerPage);
  const slice  = items.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage);

  const stats = {
    total: activities.length,
    today: activities.filter(a => new Date(getTimestamp(a)).toDateString() === new Date().toDateString()).length,
    week:  activities.filter(a => new Date(getTimestamp(a)) >= (d=>{d.setDate(d.getDate()-7); return d;})(new Date())).length,
    peak:  Math.max(0,...activityTypes.map(t=>activities.filter(a=>a.type===t.id).length))
  };

  /* ---------------- render --------------------------------------- */
  return (
    <div className="activity-log">

      {/* header */}
      <div className="activity-header">
        <div className="header-content">
          <h1>📋 Activity Log</h1>
          <p>Complete history of all system activities and user interactions</p>
        </div>
        <div className="header-actions">
          <button className="action-btn secondary" onClick={exportActivities}>📤 Export Log</button>
          {isAdmin && <button className="action-btn danger" onClick={clearActivities}>🗑️ Clear All</button>}
        </div>
      </div>

      {/* mini stats */}
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon">📊</div><div className="stat-content"><div className="stat-number">{stats.total}</div><div className="stat-label">Total</div></div></div>
        <div className="stat-card"><div className="stat-icon">📅</div><div className="stat-content"><div className="stat-number">{stats.today}</div><div className="stat-label">Today</div></div></div>
        <div className="stat-card"><div className="stat-icon">📈</div><div className="stat-content"><div className="stat-number">{stats.week}</div><div className="stat-label">This Week</div></div></div>
        <div className="stat-card"><div className="stat-icon">🔥</div><div className="stat-content"><div className="stat-number">{stats.peak}</div><div className="stat-label">Peak</div></div></div>
      </div>

      {/* filters */}
      <div className="activity-controls">
        <input className="search-input" placeholder="Search…" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
        <select className="filter-select" value={filterType} onChange={e=>setFilterType(e.target.value)}>
          {activityTypes.map(t=> <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
        </select>
        <select className="filter-select" value={filterDate} onChange={e=>setFilterDate(e.target.value)}>
          {dateFilters.map(d=> <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select className="filter-select" value={sortBy} onChange={e=>setSortBy(e.target.value)}>
          <option value="timestamp">Date</option><option value="type">Type</option><option value="userId">User</option><option value="description">Description</option>
        </select>
        <button className="sort-btn" onClick={()=>setSortOrder(o=>o==='asc'?'desc':'asc')}>{sortOrder==='asc'?'↑':'↓'}</button>
      </div>

      {/* list */}
      <div className="activity-list-container">
        {slice.length === 0 ? (
          <div className="no-activities"><div className="no-activity-icon">📭</div><h3>No Activities Found</h3></div>
        ) : (
          <div className="activity-list">
            {slice.map(a=>(
              <div key={getId(a)} className="activity-item" onClick={()=>handleActivityClick(a)}>
                <div className="activity-icon" style={{background:`${getActivityColor(a.type)}20`,color:getActivityColor(a.type)}}>{getActivityIcon(a.type)}</div>
                <div className="activity-content">
                  <div className="activity-main">
                    <h4 className="activity-description">{a.description}</h4>
                    <div className="activity-meta">
                      <span className="activity-time">{timeAgo(getTimestamp(a))}</span>
                      {isAdmin && a.userId && <span className="activity-user">by {a.userId}</span>}
                      <span className="activity-type">{a.type}</span>
                    </div>
                  </div>
                  {a.details && <div className="activity-details">{a.details}</div>}
                </div>
                <div className="activity-actions" ref={openDropdown===getId(a)?dropdownRef:null}>
                  <button className="action-menu-btn" onClick={(e)=>handleDropdownToggle(getId(a),e)}>⋯</button>
                  {openDropdown===getId(a) && (
                    <div className="action-dropdown">
                      <button className="dropdown-item" onClick={(e)=>handleViewDetails(a,e)}>👁️ View</button>
                      <button className="dropdown-item" onClick={(e)=>handleExportActivity(a,e)}>📤 Export</button>
                      <button className="dropdown-item danger" onClick={(e)=>handleDeleteActivity(getId(a),e)}>🗑️ Delete</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* pagination */}
        {pages>1 && (
          <div className="pagination">
            <button className="page-btn" disabled={currentPage===1}   onClick={()=>setCurrentPage(p=>Math.max(p-1,1))}>← Previous</button>
            <div className="page-info">Page {currentPage} of {pages}</div>
            <button className="page-btn" disabled={currentPage===pages} onClick={()=>setCurrentPage(p=>Math.min(p+1,pages))}>Next →</button>
          </div>
        )}
      </div>

      {/* modal */}
      {showModal && selectedActivity && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3><span className="modal-icon">{getActivityIcon(selectedActivity.type)}</span> Activity Details</h3>
              <button className="close-btn" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <div className="modal-content">
              <div className="detail-group"><label>Description:</label><p>{selectedActivity.description}</p></div>
              <div className="detail-group"><label>Type:</label><span className="type-badge" style={{background:`${getActivityColor(selectedActivity.type)}20`,color:getActivityColor(selectedActivity.type)}}>{getActivityIcon(selectedActivity.type)} {selectedActivity.type}</span></div>
              <div className="detail-group"><label>Timestamp:</label><p>{new Date(getTimestamp(selectedActivity)).toLocaleString()}</p></div>
              {selectedActivity.userId && <div className="detail-group"><label>User:</label><p>{selectedActivity.userId}</p></div>}
              {selectedActivity.details && <div className="detail-group"><label>Additional Details:</label><p>{selectedActivity.details}</p></div>}
              <div className="detail-group"><label>ID:</label><p className="activity-id">{getId(selectedActivity)}</p></div>
            </div>
            <div className="modal-actions"><button className="modal-btn secondary" onClick={()=>setShowModal(false)}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
