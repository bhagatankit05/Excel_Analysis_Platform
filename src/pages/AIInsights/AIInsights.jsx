import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AIInsights.css';

const AIInsights = () => {
  const { user, isAdmin } = useAuth();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [analysisType, setAnalysisType] = useState('predictive');

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

  useEffect(() => {
    generateInsights();
  }, [selectedModel, analysisType]);

  const generateInsights = async () => {
    setLoading(true);
    
    // Simulate AI processing
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
        timestamp: new Date().toISOString()
      },
      {
        id: 2,
        type: 'anomaly',
        title: 'Data Anomaly Detected',
        description: 'Unusual spike in user activity detected on weekends',
        confidence: 94,
        impact: 'medium',
        recommendation: 'Investigate weekend traffic patterns and optimize server capacity',
        timestamp: new Date().toISOString()
      },
      {
        id: 3,
        type: 'optimization',
        title: 'Process Optimization',
        description: 'AI identified 3 bottlenecks in data processing pipeline',
        confidence: 91,
        impact: 'high',
        recommendation: 'Implement parallel processing for 40% performance improvement',
        timestamp: new Date().toISOString()
      },
      {
        id: 4,
        type: 'trend',
        title: 'Emerging Pattern',
        description: 'New customer behavior pattern emerging in mobile usage',
        confidence: 78,
        impact: 'medium',
        recommendation: 'Develop mobile-first features to capture this trend',
        timestamp: new Date().toISOString()
      }
    ];
    
    setInsights(sampleInsights);
    setLoading(false);
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
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsights;