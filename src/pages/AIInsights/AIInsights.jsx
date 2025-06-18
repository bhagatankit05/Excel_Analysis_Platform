import React, { useState, useEffect } from 'react';
import { Bar, Line, Doughnut, Pie, Radar, PolarArea } from 'react-chartjs-2';
import PlotlyChart from '../../Components/PlotlyChart/PlotlyChart';
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
import { useAuth } from '../../context/AuthContext';
import { addActivity } from '../../Components/RecentActivity/RecentActivity';
import './AIInsights.css';

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

const AIInsights = () => {
  const { user, isAdmin } = useAuth();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [analysisType, setAnalysisType] = useState('predictive');
  const [chartData, setChartData] = useState(null);
  const [chartType, setChartType] = useState('bar');
  const [uploadedData, setUploadedData] = useState(null);
  const [showPlotly, setShowPlotly] = useState(false);

  const aiModels = [
    { id: 'gpt-4', name: 'GPT-4 Turbo', description: 'Advanced language model for complex analysis' },
    { id: 'claude-3', name: 'Claude 3 Opus', description: 'Anthropic\'s most capable model' },
    { id: 'gemini-pro', name: 'Gemini Pro', description: 'Google\'s multimodal AI model' },
    { id: 'llama-2', name: 'LLaMA 2', description: 'Meta\'s open-source language model' }
  ];

  const analysisTypes = [
    { id: 'predictive', name: 'Predictive Analytics', icon: '🔮' },
    { id: 'anomaly', name: 'Anomaly Detection', icon: '🚨' },
    { id: 'clustering', name: 'Data Clustering', icon: '🎯' },
    { id: 'sentiment', name: 'Sentiment Analysis', icon: '😊' },
    { id: 'trend', name: 'Trend Analysis', icon: '📈' },
    { id: 'correlation', name: 'Correlation Analysis', icon: '🔗' }
  ];

  const chartTypes = [
    { id: 'bar', name: 'Bar Chart', icon: '📊' },
    { id: 'line', name: 'Line Chart', icon: '📈' },
    { id: 'doughnut', name: 'Doughnut Chart', icon: '🍩' },
    { id: 'pie', name: 'Pie Chart', icon: '🥧' },
    { id: 'radar', name: 'Radar Chart', icon: '🎯' },
    { id: 'polarArea', name: 'Polar Area', icon: '🌟' }
  ];

  useEffect(() => {
    loadUploadedData();
    generateInsights();
  }, [selectedModel, analysisType]);

  const loadUploadedData = () => {
    const files = JSON.parse(localStorage.getItem('uploadedFiles')) || [];
    const rawData = JSON.parse(localStorage.getItem('rawData')) || null;
    
    if (files.length > 0) {
      const latestFile = files[files.length - 1];
      setUploadedData(latestFile);
      if (rawData) {
        generateChartData(rawData);
      } else if (latestFile.data) {
        generateChartData(latestFile.data);
      }
    }
  };

  const generateChartData = (data) => {
    if (!data || data.length === 0) return;

    const chartData = data.slice(0, 10);
    const keys = Object.keys(chartData[0] || {});
    
    const numericColumns = keys.filter(key => {
      return chartData.every(row => !isNaN(parseFloat(row[key])));
    });

    if (numericColumns.length === 0) return;

    const labels = chartData.map((row, index) => row[keys[0]] || `Item ${index + 1}`);
    const primaryColumn = numericColumns[0];
    const values = chartData.map(row => parseFloat(row[primaryColumn]) || 0);

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

    const newChartData = {
      labels,
      datasets: [{
        label: primaryColumn,
        data: values,
        backgroundColor: colors,
        borderColor: colors.map(color => color.replace('0.8', '1')),
        borderWidth: 2,
        borderRadius: chartType === 'bar' ? 8 : 0,
        tension: chartType === 'line' ? 0.4 : 0
      }]
    };

    setChartData(newChartData);
  };

  const generateInsights = async () => {
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const sampleInsights = [
      {
        id: 1,
        type: 'prediction',
        title: 'Revenue Forecast',
        description: 'Based on current trends, revenue is projected to increase by 23% next quarter',
        confidence: 87,
        impact: 'high',
        recommendation: 'Consider scaling marketing efforts to capitalize on growth momentum',
        timestamp: new Date().toISOString(),
        model: selectedModel,
        analysisType: analysisType
      },
      {
        id: 2,
        type: 'anomaly',
        title: 'Data Anomaly Detected',
        description: 'Unusual spike in user activity detected on weekends',
        confidence: 94,
        impact: 'medium',
        recommendation: 'Investigate weekend traffic patterns and optimize server capacity',
        timestamp: new Date().toISOString(),
        model: selectedModel,
        analysisType: analysisType
      },
      {
        id: 3,
        type: 'optimization',
        title: 'Process Optimization',
        description: 'AI identified 3 bottlenecks in data processing pipeline',
        confidence: 91,
        impact: 'high',
        recommendation: 'Implement parallel processing for 40% performance improvement',
        timestamp: new Date().toISOString(),
        model: selectedModel,
        analysisType: analysisType
      },
      {
        id: 4,
        type: 'trend',
        title: 'Emerging Pattern',
        description: 'New customer behavior pattern emerging in mobile usage',
        confidence: 78,
        impact: 'medium',
        recommendation: 'Develop mobile-first features to capture this trend',
        timestamp: new Date().toISOString(),
        model: selectedModel,
        analysisType: analysisType
      },
      {
        id: 5,
        type: 'correlation',
        title: 'Strong Correlation Found',
        description: 'High correlation (0.89) between marketing spend and customer acquisition',
        confidence: 96,
        impact: 'high',
        recommendation: 'Increase marketing budget allocation for Q4',
        timestamp: new Date().toISOString(),
        model: selectedModel,
        analysisType: analysisType
      }
    ];
    
    setInsights(sampleInsights);
    setLoading(false);

    addActivity('ai_insight', `Generated ${sampleInsights.length} AI insights`, `Using ${selectedModel} model`);
  };

  const downloadChart = (format) => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    if (format === 'png') {
      const link = document.createElement('a');
      link.download = `chart-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } else if (format === 'pdf') {
      const link = document.createElement('a');
      link.download = `chart-${Date.now()}.pdf`;
      link.href = canvas.toDataURL();
      link.click();
      alert('Chart downloaded as image. For proper PDF conversion, consider using a PDF library.');
    }

    addActivity('export', `Downloaded chart as ${format.toUpperCase()}`, 'Chart visualization exported');
  };

  const renderChart = () => {
    if (!chartData) return <div className="chart-loading">No data available for visualization</div>;

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
          text: `${uploadedData?.name || 'Data'} Visualization`,
          font: { size: 16, weight: '600' },
          padding: 20
        }
      },
      scales: ['bar', 'line'].includes(chartType) ? {
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
      case 'pie':
        return <Pie data={chartData} options={chartOptions} />;
      case 'radar':
        return <Radar data={chartData} options={chartOptions} />;
      case 'polarArea':
        return <PolarArea data={chartData} options={chartOptions} />;
      default:
        return <Bar data={chartData} options={chartOptions} />;
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return '#f5576c';
      case 'medium': return '#feca57';
      case 'low': return '#48bb78';
      default: return '#667eea';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return '#48bb78';
    if (confidence >= 70) return '#feca57';
    return '#f5576c';
  };

  return (
    <div className="ai-insights">
      <div className="insights-header">
        <div className="header-content">
          <h1>🧠 AI Insights Engine</h1>
          <p>Advanced machine learning analytics and predictions</p>
        </div>
        
        <div className="ai-controls">
          <div className="control-group">
            <label>AI Model</label>
            <select 
              value={selectedModel} 
              onChange={(e) => setSelectedModel(e.target.value)}
              className="ai-select"
            >
              {aiModels.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="control-group">
            <label>Analysis Type</label>
            <select 
              value={analysisType} 
              onChange={(e) => setAnalysisType(e.target.value)}
              className="ai-select"
            >
              {analysisTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.name}
                </option>
              ))}
            </select>
          </div>
          
          <button className="generate-btn" onClick={generateInsights}>
            <span>🔄</span>
            Regenerate
          </button>
        </div>
      </div>

      <div className="chart-section">
        <div className="chart-header">
          <h3>📊 Data Visualization</h3>
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
        
        <div className="chart-container">
          {showPlotly ? (
            <PlotlyChart data={JSON.parse(localStorage.getItem('rawData')) || uploadedData?.data} />
          ) : (
            renderChart()
          )}
        </div>
        
        <div className="chart-actions">
          <button className="download-btn" onClick={() => downloadChart('png')}>
            📷 Download PNG
          </button>
          <button className="download-btn" onClick={() => downloadChart('pdf')}>
            📄 Download PDF
          </button>
        </div>
      </div>

      <div className="model-info">
        <div className="model-card">
          <h3>{aiModels.find(m => m.id === selectedModel)?.name}</h3>
          <p>{aiModels.find(m => m.id === selectedModel)?.description}</p>
          <div className="model-stats">
            <div className="stat">
              <span className="stat-label">Status</span>
              <span className="stat-value online">🟢 Online</span>
            </div>
            <div className="stat">
              <span className="stat-label">Response Time</span>
              <span className="stat-value">~2.3s</span>
            </div>
            <div className="stat">
              <span className="stat-label">Accuracy</span>
              <span className="stat-value">94.7%</span>
            </div>
            <div className="stat">
              <span className="stat-label">Data Points</span>
              <span className="stat-value">{uploadedData?.rowCount || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-section">
          <div className="ai-loader">
            <div className="loader-brain">🧠</div>
            <div className="loader-text">AI is analyzing your data...</div>
            <div className="loader-progress">
              <div className="progress-bar"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="insights-grid">
          {insights.map(insight => (
            <div key={insight.id} className="insight-card">
              <div className="insight-header">
                <div className="insight-type">
                  <span className="type-icon">
                    {insight.type === 'prediction' && '🔮'}
                    {insight.type === 'anomaly' && '🚨'}
                    {insight.type === 'optimization' && '⚡'}
                    {insight.type === 'trend' && '📈'}
                    {insight.type === 'correlation' && '🔗'}
                  </span>
                  <span className="type-label">{insight.type}</span>
                </div>
                <div className="insight-confidence">
                  <div 
                    className="confidence-circle"
                    style={{ 
                      background: `conic-gradient(${getConfidenceColor(insight.confidence)} ${insight.confidence * 3.6}deg, #e2e8f0 0deg)`
                    }}
                  >
                    <span>{insight.confidence}%</span>
                  </div>
                </div>
              </div>
              
              <div className="insight-content">
                <h3>{insight.title}</h3>
                <p>{insight.description}</p>
                
                <div className="insight-meta">
                  <div className="impact-badge" style={{ backgroundColor: getImpactColor(insight.impact) }}>
                    {insight.impact.toUpperCase()} IMPACT
                  </div>
                  <div className="timestamp">
                    {new Date(insight.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                
                <div className="recommendation">
                  <h4>💡 Recommendation</h4>
                  <p>{insight.recommendation}</p>
                </div>

                <div className="insight-details">
                  <small>Model: {insight.model} | Type: {insight.analysisType}</small>
                </div>
              </div>
              
              <div className="insight-actions">
                <button className="action-btn primary">Apply</button>
                <button className="action-btn secondary">Details</button>
                <button className="action-btn tertiary">Export</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAdmin && (
        <div className="ai-management">
          <h2>🔧 AI Model Management</h2>
          <div className="management-grid">
            <div className="management-card">
              <h3>Model Training</h3>
              <p>Train custom models on your data</p>
              <button className="management-btn">Start Training</button>
            </div>
            <div className="management-card">
              <h3>Performance Metrics</h3>
              <p>Monitor AI model performance</p>
              <button className="management-btn">View Metrics</button>
            </div>
            <div className="management-card">
              <h3>Data Pipeline</h3>
              <p>Configure AI data processing</p>
              <button className="management-btn">Configure</button>
            </div>
            <div className="management-card">
              <h3>Export Reports</h3>
              <p>Download comprehensive analysis reports</p>
              <button className="management-btn">Generate Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsights;