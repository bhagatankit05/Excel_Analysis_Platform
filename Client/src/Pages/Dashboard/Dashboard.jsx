import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StatsCard from '../../Components/StatsCard/StatsCard';
import RecentActivity from '../../Components/RecentActivity/RecentActivity.jsx';
import ReportGenerator from '../../Components/ReportGenerator/ReportGenerator';
import PlotlyChart from '../../Components/PlotlyChart/PlotlyChart';
import * as XLSX from 'xlsx';
import { Bar, Line, Doughnut, Pie, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { addActivity } from '../../Components/RecentActivity/RecentActivity';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const fileInputRef = useRef(null);
  const chartRef = useRef(null);
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalAnalyses: 0,
    activeUsers: 0,
    recentUploads: 0
  });
  const [chartData, setChartData] = useState(null);
  const [rawData, setRawData] = useState(null);
  const [chartType, setChartType] = useState('bar');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [aiReport, setAiReport] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [showPlotly, setShowPlotly] = useState(false);

  const chartTypes = [
    { id: 'bar', name: 'Bar Chart', icon: '📊' },
    { id: 'line', name: 'Line Chart', icon: '📈' },
    { id: 'doughnut', name: 'Doughnut', icon: '🍩' },
    { id: 'pie', name: 'Pie Chart', icon: '🥧' },
    { id: 'radar', name: 'Radar Chart', icon: '🎯' }
  ];

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
    const savedRawData = localStorage.getItem('rawData');
    
    if (savedChartData) {
      try {
        const data = JSON.parse(savedChartData);
        setChartData(data);
        generateAIReport(data);
      } catch (error) {
        console.error('Error loading chart data:', error);
      }
    }
    
    if (savedRawData) {
      try {
        const data = JSON.parse(savedRawData);
        setRawData(data);
      } catch (error) {
        console.error('Error loading raw data:', error);
      }
    }
  };

  const generateAIReport = async (data) => {
    if (!data || !data.datasets || data.datasets.length === 0) return;

    setGeneratingReport(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const values = data.datasets[0].data;
      const labels = data.labels;
      
      const total = values.reduce((acc, val) => acc + val, 0);
      const average = total / values.length;
      const max = Math.max(...values);
      const min = Math.min(...values);
      const maxIndex = values.indexOf(max);
      const minIndex = values.indexOf(min);
      
      const insights = [
        {
          type: 'summary',
          title: 'Data Overview',
          description: `Dataset contains ${values.length} data points with a total value of ${total.toFixed(2)}`,
          confidence: 100
        },
        {
          type: 'trend',
          title: 'Performance Analysis',
          description: `Average value is ${average.toFixed(2)}. Highest performer: ${labels[maxIndex]} (${max})`,
          confidence: 95
        },
        {
          type: 'insight',
          title: 'Key Finding',
          description: `${((max - min) / average * 100).toFixed(1)}% variance detected. ${labels[maxIndex]} outperforms ${labels[minIndex]} by ${((max - min) / min * 100).toFixed(1)}%`,
          confidence: 88
        },
        {
          type: 'recommendation',
          title: 'Strategic Recommendation',
          description: values.some(v => v > average * 1.5) 
            ? 'Focus resources on top performers to maximize ROI'
            : 'Consider optimization strategies to improve overall performance',
          confidence: 82
        }
      ];

      const report = {
        timestamp: new Date().toISOString(),
        dataPoints: values.length,
        statistics: { total, average, max, min },
        insights,
        recommendations: [
          'Monitor high-performing segments for scalability opportunities',
          'Investigate underperforming areas for improvement potential',
          'Consider data-driven resource allocation based on performance metrics'
        ]
      };

      setAiReport(report);
      addActivity('ai_insight', 'Generated AI report from dashboard data', `${insights.length} insights created`);
      
    } catch (error) {
      console.error('Error generating AI report:', error);
    } finally {
      setGeneratingReport(false);
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

      const processedData = processExcelData(jsonData);
      setChartData(processedData.chartData);
      setRawData(jsonData);

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
      localStorage.setItem('rawData', JSON.stringify(jsonData));

      generateAIReport(processedData.chartData);
      loadDashboardData();

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
    const keys = Object.keys(jsonData[0] || {});
    if (keys.length < 2) {
      throw new Error('Excel file must have at least 2 columns');
    }

    const labelColumn = keys[0];
    const valueColumn = keys[1];

    const labels = jsonData.slice(0, 10).map(row => String(row[labelColumn] || 'Unknown'));
    const values = jsonData.slice(0, 10).map(row => {
      const val = parseFloat(row[valueColumn]);
      return isNaN(val) ? 0 : val;
    });

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
        tension: 0.4
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
          height: '400px',
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
      scales: !['doughnut', 'pie', 'radar'].includes(chartType) ? {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0, 0, 0, 0.05)' },
          ticks: { font: { size: 11 } }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 } }
        }
      } : chartType === 'radar' ? {
        r: {
          beginAtZero: true,
          grid: { color: 'rgba(0, 0, 0, 0.1)' },
          ticks: { font: { size: 10 } }
        }
      } : {}
    };

    const ChartComponent = {
      bar: Bar,
      line: Line,
      doughnut: Doughnut,
      pie: Pie,
      radar: Radar
    }[chartType];

    return <ChartComponent ref={chartRef} data={chartData} options={chartOptions} />;
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
            <h3>📊 Data Visualization Hub</h3>
            <div className="chart-controls">
              <button
                className={`chart-btn ${!showPlotly ? 'active' : ''}`}
                onClick={() => setShowPlotly(false)}
              >
                📊 Chart.js
              </button>
              <button
                className={`chart-btn ${showPlotly ? 'active' : ''}`}
                onClick={() => setShowPlotly(true)}
              >
                🎯 3D Plots
              </button>
              {!showPlotly && chartTypes.map(type => (
                <button
                  key={type.id}
                  className={`chart-btn ${chartType === type.id ? 'active' : ''}`}
                  onClick={() => setChartType(type.id)}
                >
                  {type.icon} {type.name}
                </button>
              ))}
            </div>
          </div>
          
          {showPlotly ? (
            <PlotlyChart data={rawData} />
          ) : (
            <div className="chart-container" style={{ height: '400px', position: 'relative' }}>
              {renderChart()}
            </div>
          )}
          
          {aiReport && (
            <div className="ai-report-section">
              <div className="report-header">
                <h4>🧠 AI Analysis Report</h4>
                <span className="report-timestamp">
                  Generated: {new Date(aiReport.timestamp).toLocaleString()}
                </span>
              </div>
              
              <div className="report-stats">
                <div className="stat-item">
                  <span className="stat-value">{aiReport.dataPoints}</span>
                  <span className="stat-label">Data Points</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{aiReport.statistics.average.toFixed(2)}</span>
                  <span className="stat-label">Average</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{aiReport.statistics.max}</span>
                  <span className="stat-label">Peak Value</span>
                </div>
              </div>

              <div className="insights-grid">
                {aiReport.insights.map((insight, index) => (
                  <div key={index} className="insight-card">
                    <div className="insight-header">
                      <span className="insight-type">{insight.type}</span>
                      <span className="confidence-badge">{insight.confidence}%</span>
                    </div>
                    <h5>{insight.title}</h5>
                    <p>{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {generatingReport && (
            <div className="generating-report">
              <div className="loading-spinner"></div>
              <span>AI is analyzing your data...</span>
            </div>
          )}
        </div>
        
        <div className="activity-section">
          <RecentActivity />
        </div>
      </div>

      {chartData && (
        <ReportGenerator 
          data={{
            rowCount: stats.totalFiles,
            columnCount: 5,
            fileName: uploadedFile?.name || 'Dashboard Data',
            fullData: rawData
          }}
          chartRef={chartRef}
          insights={aiReport?.insights || []}
        />
      )}

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