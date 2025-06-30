import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../utils/api';
import './RecentActivity.css';

/* ---------------- helpers ---------------- */
const usernameFromJWT = (tok) => {
  try {
    const base = tok.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const pay  = JSON.parse(atob(base));
    return pay.username || pay.sub || pay.userId || null;
  } catch {
    return null;
  }
};

const getTimestamp = (a) => a.timestamp || a.createdAt || a.date;
const getId        = (a) => a.id || a._id;

/* ------------- public logger ------------- */
/* ① addActivity('upload','desc','details')
   ② addActivity(token,username,'upload','desc','details') */
export const addActivity = async (...args) => {
  let token, username, type, description, details = null;

  if (typeof args[0] === 'string') {
    [type, description, details] = args;
    const raw = localStorage.getItem('token');
    if (!raw) return;
    try { const p = JSON.parse(raw); token = p.token || p.access_token || raw; }
    catch { token = raw; }
    username = usernameFromJWT(token);
  } else {
    [token, username, type, description, details] = args;
  }
  if (!token || !username) return;

  const activity = { type, description, details, userId: username };

  try {
    await apiClient.request('/activities', {
      method: 'POST',
      body: JSON.stringify(activity),
      withCredentials: true
    });
    window.dispatchEvent(new CustomEvent('activityUpdate'));
  } catch (err) {
    console.error('❌ Failed to log activity:', err.message);
  }
};

/* ------------- widget component ---------- */
const RecentActivity = () => {
  const { user, isAdmin } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading,     setLoading]   = useState(false);

  const load = async () => {
    if (!user?.username) return;
    setLoading(true);
    try {
      const params = isAdmin ? { isAdmin: true } : { userId: user.username };
      const res    = await apiClient.getActivities(params, { withCredentials: true });
      const list   = res.data || res;
      const sorted = [...list].sort((a,b)=> new Date(getTimestamp(b)) - new Date(getTimestamp(a))).slice(0,15);
      setActivities(sorted);
    } catch (err) { console.error('Load activities:', err.message); }
    finally      { setLoading(false); }
  };

  useEffect(() => { load(); }, [isAdmin]);
  useEffect(() => {
    const f = () => load();
    window.addEventListener('activityUpdate', f);
    return () => window.removeEventListener('activityUpdate', f);
  }, []);

  const color = (t)=>({
    upload:'#667eea',analysis:'#764ba2',report:'#f093fb',login:'#48bb78',logout:'#f5576c',
    settings:'#feca57',ai_insight:'#ff6b6b',export:'#4ecdc4',delete:'#ff7675',user_created:'#74b9ff',
    system:'#a29bfe',download:'#00b894',chart_view:'#e17055',data_process:'#6c5ce7'
  }[t]||'#718096');

  const icon = (t)=>({
    upload:'📤',analysis:'🔍',report:'📊',login:'🔐',logout:'🚪',settings:'⚙️',ai_insight:'🧠',
    export:'📄',delete:'🗑️',user_created:'👤',system:'🖥️',download:'📥',chart_view:'📈',data_process:'⚡'
  }[t]||'📋');

  const ago = (ts)=>{
    const s=(Date.now()-new Date(ts))/1000;
    if(s<60) return'Just now';
    if(s<3600) return`${Math.floor(s/60)}m ago`;
    if(s<86400) return`${Math.floor(s/3600)}h ago`;
    if(s<604800) return`${Math.floor(s/86400)}d ago`;
    return new Date(ts).toLocaleDateString();
  };

  const exportAll = () => {
    const blob = new Blob([JSON.stringify(activities,null,2)],{type:'application/json'});
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'),{
      href:url,download:`activity-log-${user?.username}-${new Date().toISOString().slice(0,10)}.json`
    });
    a.click(); URL.revokeObjectURL(url);
    addActivity('export','Exported activity log','Downloaded JSON');
  };

  const clear = async () => {
    if(!confirm('Clear all activities?')) return;
    try {
      const userId = isAdmin ? null : user.username;
      await apiClient.clearActivities(userId,{withCredentials:true});
      setActivities([]);
      addActivity('system','Cleared activity log','All removed');
    } catch(err){ console.error('Clear activities:',err.message);}
  };

  if (loading)
    return <div className="recent-activity"><div className="activity-header"><h3>Recent Activity</h3></div><div className="activity-loading"><div className="loading-spinner"/><span>Loading…</span></div></div>;

  return (
    <div className="recent-activity">
      <div className="activity-header">
        <h3>🕒 Activity Log</h3>
        <div className="activity-controls">
          <button className="control-btn" title="Refresh" onClick={load}>🔄</button>
          <button className="control-btn" title="Export"  onClick={exportAll}>📤</button>
          {isAdmin && <button className="control-btn danger" title="Clear All" onClick={clear}>🗑️</button>}
        </div>
      </div>

      <div className="activity-list">
        {activities.length===0 ? (
          <div className="no-activities">
            <div className="no-activity-icon">📭</div>
            <p>No recent activities</p>
            <span>Activities will appear here as you use the platform</span>
          </div>
        ) : activities.map(a=>(
          <div key={getId(a)} className="activity-item">
            <div className="activity-icon" style={{background:`${color(a.type)}20`,color:color(a.type)}}>{icon(a.type)}</div>
            <div className="activity-content">
              <p className="activity-description">{a.description}</p>
              <div className="activity-meta">
                <span className="activity-time">{ago(getTimestamp(a))}</span>
                {isAdmin && a.userId && <span className="activity-user">by {a.userId}</span>}
                {a.details && <span className="activity-details">{a.details}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="activity-footer">
        <button className="refresh-btn" onClick={load}><span>🔄</span> Refresh Activities</button>
      </div>
    </div>
  );
};

export default RecentActivity;
