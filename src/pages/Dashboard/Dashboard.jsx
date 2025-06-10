import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StatsCard from '../../components/StatsCard/StatsCard';
import ChartWidget from '../../components/ChartWidget/ChartWidget';
import RecentActivity from '../../components/RecentActivity/RecentActivity';
import * as XLSX from 'xlsx';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { addActivity } from '../../components/RecentActivity/RecentActivity';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const fileInputRef = useRef(null);
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalAnalyses: 0,
    activeUsers: 0,
    recentUploads: 0
  });
  const [chartData, setChartData] = useState(null);
  const [chartType, setChartType] = useState('bar');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
    loadExistingChartData();
  }, [isAdmin]);

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

  const loadExistingChartData = () => {
    const savedChartData = localStorage.getItem('chartData');
    if (savedChartData) {
      try {
        setChartData(JSON.parse(savedChartData));
      } catch (error) {
        console.error('Error loading chart data:', error);
      }
    }
  };

  const handleUploadClick = () => {
    setShowUploadModal(true);
  };

  const handleAnalyzeClick = () => {
    navigate('/ai-insights');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls)$/)) {
      alert('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }

    setLoading(true);
    setUploadedFile(file);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        alert('Excel file is empty or improperly formatted.');
        setLoading(false);
        return;
      }

      // Process data for charts
      const processedData = processExcelData(jsonData);
      setChartData(processedData.chartData);

      // Save to localStorage
      const uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles')) || [];
      const fileRecord = {
        id: Date.now(),
        name: file.name,
        size: file.size,
        uploadDate: new Date().toISOString(),
        rowCount: jsonData.length,
        columnCount: Object.keys(jsonData[0] || {}).length,
        data: jsonData
      };
      uploadedFiles.push(fileRecord);
      localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
      localStorage.setItem('chartData', JSON.stringify(processedData.chartData));

      // Update stats
      loadDashboardData();

      // Add activity
      addActivity('upload', `Uploaded file: ${file.name}`, `${jsonData.length} rows processed`);

      alert('File uploaded and processed successfully!');
      setShowUploadModal(false);

    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
      addActivity('upload', `Failed to upload file: ${file.name}`, 'Error during processing');
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const processExcelData = (jsonData) => {
    // Find the first two columns for chart data
    const keys = Object.keys(jsonData[0] || {});
    if (keys.length < 2) {
      throw new Error('Excel file must have at least 2 columns');
    }

    const labelColumn = keys[0];
    const valueColumn = keys[1];

    // Extract labels and values
    const labels = jsonData.slice(0, 10).map(row => String(row[labelColumn] || 'Unknown'));
    const values = jsonData.slice(0, 10).map(row => {
      const val = parseFloat(row[valueColumn]);
      return isNaN(val) ? 0 : val;
    });

    // Generate colors
    const colors = [
      'rgba(102, 126, 234, 0.8)',
      'rgba(118, 75, 162, 0.8)',
      'rgba(240, 147, 251, 0.8)',
      'rgba(245, 87, 108, 0.8)',
      'rgba(254, 202, 87, 0.8)',
      'rgba(72, 187, 120, 0.8)',
      'rgba(99, 179, 237, 0.8)',
      'rgba(161, 136, 127, 0.8)',
      'rgba(255, 159, 64, 0.8)',
      'rgba(201, 203, 207, 0.8)'
    ];

    const chartData = {
      labels,
      datasets: [{
        label: valueColumn,
        data: values,
        backgroundColor: colors,
        borderColor: colors.map(color => color.replace('0.8', '1')),
        borderWidth: 2,
        borderRadius: 8,
      }]
    };

    return {
      chartData,
      summary: {
        totalRows: jsonData.length,
        totalColumns: keys.length,
        labelColumn,
        valueColumn
      }
    };
  };

  const renderChart = () => {
    if (!chartData) {
      return (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '300px',
          color: '#718096'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <p>Upload an Excel file to see your data visualization</p>
          <button 
            onClick={handleUploadClick}
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            Upload Excel File
          </button>
        </div>
      );
    }

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: { size: 12, weight: '500' }
          }
        },
        title: {
          display: true,
          text: 'Excel Data Visualization',
          font: { size: 16, weight: '600' },
          padding: 20
        }
      },
      scales: chartType !== 'doughnut' ? {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0, 0, 0, 0.05)' },
          ticks: { font: { size: 11 } }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 } }
        }
      } : {}
    };

    switch (chartType) {
      case 'line':
        return <Line data={chartData} options={chartOptions} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={chartOptions} />;
      default:
        return <Bar data={chartData} options={chartOptions} />;
    }
  };

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
          <button className="action-btn primary" onClick={handleUploadClick}>
            <span>📤</span>
            Upload Excel
          </button>
          <button className="action-btn secondary" onClick={handleAnalyzeClick}>
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
          <div className="chart-header">
            <h3>📊 Data Visualization</h3>
            <div className="chart-controls">
              <button
                className={`chart-btn ${chartType === 'bar' ? 'active' : ''}`}
                onClick={() => setChartType('bar')}
              >
                📊 Bar
              </button>
              <button
                className={`chart-btn ${chartType === 'line' ? 'active' : ''}`}
                onClick={() => setChartType('line')}
              >
                📈 Line
              </button>
              <button
                className={`chart-btn ${chartType === 'doughnut' ? 'active' : ''}`}
                onClick={() => setChartType('doughnut')}
              >
                🍩 Doughnut
              </button>
            </div>
          </div>
          <div className="chart-container" style={{ height: '400px', position: 'relative' }}>
            {renderChart()}
          </div>
        </div>
        <div className="activity-section">
          <RecentActivity />
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="upload-modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📤 Upload Excel File</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowUploadModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-content">
              {loading ? (
                <div className="loading-section">
                  <div className="loading-spinner"></div>
                  <p>Processing your file...</p>
                </div>
              ) : (
                <div className="upload-area">
                  <div className="upload-icon">📁</div>
                  <h4>Select Excel File</h4>
                  <p>Choose a .xlsx or .xls file to upload</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    style={{ margin: '16px 0' }}
                  />
                  <p className="upload-note">Maximum file size: 10MB</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;