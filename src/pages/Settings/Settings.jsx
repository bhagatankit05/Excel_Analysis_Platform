import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Settings.css';

const Settings = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      theme: 'dark',
      language: 'en',
      timezone: 'UTC',
      notifications: true,
      autoSave: true,
      dataRetention: '30'
    },
    security: {
      twoFactor: false,
      sessionTimeout: '30',
      passwordExpiry: '90',
      loginNotifications: true,
      apiAccess: false
    },
    performance: {
      cacheEnabled: true,
      compressionLevel: 'medium',
      maxConcurrentJobs: '5',
      memoryLimit: '8',
      cpuThrottling: false
    },
    ai: {
      defaultModel: 'gpt-4',
      maxTokens: '4000',
      temperature: '0.7',
      enableAutoAnalysis: true,
      confidenceThreshold: '70'
    }
  });

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
    { id: 'ai', label: 'AI Configuration', icon: '🧠' }
  ];

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const saveSettings = () => {
    localStorage.setItem('systemSettings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      // Reset to default values
      setSettings({
        general: {
          theme: 'dark',
          language: 'en',
          timezone: 'UTC',
          notifications: true,
          autoSave: true,
          dataRetention: '30'
        },
        security: {
          twoFactor: false,
          sessionTimeout: '30',
          passwordExpiry: '90',
          loginNotifications: true,
          apiAccess: false
        },
        performance: {
          cacheEnabled: true,
          compressionLevel: 'medium',
          maxConcurrentJobs: '5',
          memoryLimit: '8',
          cpuThrottling: false
        },
        ai: {
          defaultModel: 'gpt-4',
          maxTokens: '4000',
          temperature: '0.7',
          enableAutoAnalysis: true,
          confidenceThreshold: '70'
        }
      });
    }
  };

  const renderGeneralSettings = () => (
    <div className="settings-section">
      <h3>🌐 General Configuration</h3>
      
      <div className="setting-group">
        <label>Theme</label>
        <select 
          value={settings.general.theme}
          onChange={(e) => handleSettingChange('general', 'theme', e.target.value)}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>
      </div>

      <div className="setting-group">
        <label>Language</label>
        <select 
          value={settings.general.language}
          onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
      </div>

      <div className="setting-group">
        <label>Timezone</label>
        <select 
          value={settings.general.timezone}
          onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
        >
          <option value="UTC">UTC</option>
          <option value="EST">Eastern Time</option>
          <option value="PST">Pacific Time</option>
          <option value="GMT">Greenwich Mean Time</option>
        </select>
      </div>

      <div className="setting-group">
        <label>Data Retention (days)</label>
        <input 
          type="number"
          value={settings.general.dataRetention}
          onChange={(e) => handleSettingChange('general', 'dataRetention', e.target.value)}
          min="1"
          max="365"
        />
      </div>

      <div className="setting-toggle">
        <label>
          <input 
            type="checkbox"
            checked={settings.general.notifications}
            onChange={(e) => handleSettingChange('general', 'notifications', e.target.checked)}
          />
          <span>Enable Notifications</span>
        </label>
      </div>

      <div className="setting-toggle">
        <label>
          <input 
            type="checkbox"
            checked={settings.general.autoSave}
            onChange={(e) => handleSettingChange('general', 'autoSave', e.target.checked)}
          />
          <span>Auto-save Data</span>
        </label>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="settings-section">
      <h3>🔒 Security Configuration</h3>
      
      <div className="setting-group">
        <label>Session Timeout (minutes)</label>
        <input 
          type="number"
          value={settings.security.sessionTimeout}
          onChange={(e) => handleSettingChange('security', 'sessionTimeout', e.target.value)}
          min="5"
          max="480"
        />
      </div>

      <div className="setting-group">
        <label>Password Expiry (days)</label>
        <input 
          type="number"
          value={settings.security.passwordExpiry}
          onChange={(e) => handleSettingChange('security', 'passwordExpiry', e.target.value)}
          min="30"
          max="365"
        />
      </div>

      <div className="setting-toggle">
        <label>
          <input 
            type="checkbox"
            checked={settings.security.twoFactor}
            onChange={(e) => handleSettingChange('security', 'twoFactor', e.target.checked)}
          />
          <span>Two-Factor Authentication</span>
        </label>
      </div>

      <div className="setting-toggle">
        <label>
          <input 
            type="checkbox"
            checked={settings.security.loginNotifications}
            onChange={(e) => handleSettingChange('security', 'loginNotifications', e.target.checked)}
          />
          <span>Login Notifications</span>
        </label>
      </div>

      <div className="setting-toggle">
        <label>
          <input 
            type="checkbox"
            checked={settings.security.apiAccess}
            onChange={(e) => handleSettingChange('security', 'apiAccess', e.target.checked)}
          />
          <span>API Access Enabled</span>
        </label>
      </div>
    </div>
  );

  const renderPerformanceSettings = () => (
    <div className="settings-section">
      <h3>⚡ Performance Configuration</h3>
      
      <div className="setting-group">
        <label>Compression Level</label>
        <select 
          value={settings.performance.compressionLevel}
          onChange={(e) => handleSettingChange('performance', 'compressionLevel', e.target.value)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="setting-group">
        <label>Max Concurrent Jobs</label>
        <input 
          type="number"
          value={settings.performance.maxConcurrentJobs}
          onChange={(e) => handleSettingChange('performance', 'maxConcurrentJobs', e.target.value)}
          min="1"
          max="20"
        />
      </div>

      <div className="setting-group">
        <label>Memory Limit (GB)</label>
        <input 
          type="number"
          value={settings.performance.memoryLimit}
          onChange={(e) => handleSettingChange('performance', 'memoryLimit', e.target.value)}
          min="1"
          max="64"
        />
      </div>

      <div className="setting-toggle">
        <label>
          <input 
            type="checkbox"
            checked={settings.performance.cacheEnabled}
            onChange={(e) => handleSettingChange('performance', 'cacheEnabled', e.target.checked)}
          />
          <span>Enable Caching</span>
        </label>
      </div>

      <div className="setting-toggle">
        <label>
          <input 
            type="checkbox"
            checked={settings.performance.cpuThrottling}
            onChange={(e) => handleSettingChange('performance', 'cpuThrottling', e.target.checked)}
          />
          <span>CPU Throttling</span>
        </label>
      </div>
    </div>
  );

  const renderAISettings = () => (
    <div className="settings-section">
      <h3>🧠 AI Configuration</h3>
      
      <div className="setting-group">
        <label>Default AI Model</label>
        <select 
          value={settings.ai.defaultModel}
          onChange={(e) => handleSettingChange('ai', 'defaultModel', e.target.value)}
        >
          <option value="gpt-4">GPT-4 Turbo</option>
          <option value="claude-3">Claude 3 Opus</option>
          <option value="gemini-pro">Gemini Pro</option>
          <option value="llama-2">LLaMA 2</option>
        </select>
      </div>

      <div className="setting-group">
        <label>Max Tokens</label>
        <input 
          type="number"
          value={settings.ai.maxTokens}
          onChange={(e) => handleSettingChange('ai', 'maxTokens', e.target.value)}
          min="1000"
          max="8000"
        />
      </div>

      <div className="setting-group">
        <label>Temperature (Creativity)</label>
        <input 
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={settings.ai.temperature}
          onChange={(e) => handleSettingChange('ai', 'temperature', e.target.value)}
        />
        <span className="range-value">{settings.ai.temperature}</span>
      </div>

      <div className="setting-group">
        <label>Confidence Threshold (%)</label>
        <input 
          type="range"
          min="50"
          max="95"
          step="5"
          value={settings.ai.confidenceThreshold}
          onChange={(e) => handleSettingChange('ai', 'confidenceThreshold', e.target.value)}
        />
        <span className="range-value">{settings.ai.confidenceThreshold}%</span>
      </div>

      <div className="setting-toggle">
        <label>
          <input 
            type="checkbox"
            checked={settings.ai.enableAutoAnalysis}
            onChange={(e) => handleSettingChange('ai', 'enableAutoAnalysis', e.target.checked)}
          />
          <span>Enable Auto-Analysis</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="settings">
      <div className="settings-header">
        <h1>⚙️ System Configuration</h1>
        <p>Configure DataFlow Analytics to match your requirements</p>
      </div>

      <div className="settings-container">
        <div className="settings-sidebar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="settings-content">
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'security' && renderSecuritySettings()}
          {activeTab === 'performance' && renderPerformanceSettings()}
          {activeTab === 'ai' && renderAISettings()}

          <div className="settings-actions">
            <button className="save-btn" onClick={saveSettings}>
              <span>💾</span>
              Save Settings
            </button>
            <button className="reset-btn" onClick={resetSettings}>
              <span>🔄</span>
              Reset to Default
            </button>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="admin-section">
          <h2>🔧 Advanced Administration</h2>
          <div className="admin-grid">
            <div className="admin-card">
              <h3>System Logs</h3>
              <p>View and manage system logs</p>
              <button className="admin-btn">View Logs</button>
            </div>
            <div className="admin-card">
              <h3>Database Management</h3>
              <p>Backup and restore database</p>
              <button className="admin-btn">Manage DB</button>
            </div>
            <div className="admin-card">
              <h3>API Configuration</h3>
              <p>Configure API endpoints and keys</p>
              <button className="admin-btn">Configure API</button>
            </div>
            <div className="admin-card">
              <h3>System Monitoring</h3>
              <p>Monitor system performance</p>
              <button className="admin-btn">View Metrics</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;