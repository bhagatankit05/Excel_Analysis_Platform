import React, { useEffect, useState } from 'react';
import './Report.css';

const Report = () => {
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    // Simulate loading report data from localStorage or API
    // For now, assume saved chart data is stored in localStorage under 'chartData'
    const savedData = localStorage.getItem('chartData');
    if (savedData) {
      setReportData(JSON.parse(savedData));
    }
  }, []);

  if (!reportData) {
    return (
      <div className="reports-container">
        <h2>Reports</h2>
        <p>No report data available. Please upload an Excel file in Dashboard first.</p>
      </div>
    );
  }

  // Basic analytics: total sum, average, min, max
  const values = reportData.datasets[0].data;
  const total = values.reduce((acc, val) => acc + val, 0);
  const avg = (total / values.length).toFixed(2);
  const min = Math.min(...values);
  const max = Math.max(...values);

  return (
    <div className="reports-container">
      <h2>Reports</h2>
      <div className="summary">
        <p><strong>Total:</strong> {total}</p>
        <p><strong>Average:</strong> {avg}</p>
        <p><strong>Minimum:</strong> {min}</p>
        <p><strong>Maximum:</strong> {max}</p>
      </div>
      <div className="notes">
        <p>Reports are based on your last uploaded Excel file.</p>
      </div>
    </div>
  );
};

export default Report;
