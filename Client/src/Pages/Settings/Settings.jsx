import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Settings.css';

const Settings = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      theme: 'light',
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

  const tabs = isAdmin ? [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
    { id: 'ai', label: 'AI Configuration', icon: '🧠' }
  ] : [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'ai', label: 'AI Configuration', icon: '🧠' }
  ];

  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem('systemSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Apply theme
    applyTheme(settings.general.theme);
  }, []);

  const applyTheme = (theme) => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.style.setProperty('--bg-primary', '#1a202c');
      root.style.setProperty('--bg-secondary', '#2d3748');
      root.style.setProperty('--text-primary', '#f7fafc');
      root.style.setProperty('--text-secondary', '#e2e8f0');
      root.style.setProperty('--border-color', '#4a5568');
      document.body.classList.add('dark-theme');
    } else if (theme === 'light') {
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f7fafc');
      root.style.setProperty('--text-primary', '#1a202c');
      root.style.setProperty('--text-secondary', '#718096');
      root.style.setProperty('--border-color', '#e2e8f0');
      document.body.classList.remove('dark-theme');
    } else { // auto
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light');
    }
  };

  const handleSettingChange = (category, key, value) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value
      }
    };
    
    setSettings(newSettings);

    // Apply theme immediately if changed
    if (category === 'general' && key === 'theme') {
      applyTheme(value);
    }
  };

  const saveSettings = () => {
    localStorage.setItem('systemSettings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      const defaultSettings = {
        general: {
          theme: 'light',
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
      };
      
      setSettings(defaultSettings);
      applyTheme('light');
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `settings-${user?.username}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          setSettings(importedSettings);
          applyTheme(importedSettings.general.theme);
          alert('Settings imported successfully!');
        } catch (error) {
          alert('Error importing settings. Please check the file format.');
          console.log(error)
        }
      };
      reader.readAsText(file);
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
          <option value="auto">Auto (System)</option>
        </select>
        <small className="setting-hint">Choose your preferred color scheme</small>
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
          <option value="zh">Chinese</option>
          <option value="ja">Japanese</option>
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
          <option value="CET">Central European Time</option>
          <option value="JST">Japan Standard Time</option>
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
        <small className="setting-hint">How long to keep your data before automatic cleanup</small>
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
        <small className="setting-hint">Automatically log out after inactivity</small>
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
        <small className="setting-hint">Force password change after this period</small>
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
          <option value="low">Low (Faster)</option>
          <option value="medium">Medium (Balanced)</option>
          <option value="high">High (Smaller files)</option>
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
        <small className="setting-hint">Maximum number of simultaneous data processing jobs</small>
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
        <small className="setting-hint">Maximum tokens for AI responses</small>
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
        <small className="setting-hint">Higher values make output more creative</small>
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
        <small className="setting-hint">Minimum confidence for AI recommendations</small>
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
          {activeTab === 'performance' && isAdmin && renderPerformanceSettings()}
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
            <button className="export-btn" onClick={exportSettings}>
              <span>📤</span>
              Export Settings
            </button>
            <label className="import-btn">
              <span>📥</span>
              Import Settings
              <input 
                type="file" 
                accept=".json" 
                onChange={importSettings}
                style={{ display: 'none' }}
              />
            </label>
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