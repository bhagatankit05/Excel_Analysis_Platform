import React from 'react';
import './StatsCard.css';

const StatsCard = ({ title, value, icon, color }) => {
  return (
    <div className="stats-card" style={{ '--accent-color': color }}>
      <div className="stats-icon">
        {icon}
      </div>
      <div className="stats-content">
        <h3 className="stats-title">{title}</h3>
        <p className="stats-value">{value}</p>
      </div>
      <div className="stats-trend">
        <span className="trend-indicator">↗️</span>
      </div>
    </div>
  );
};

export default StatsCard;