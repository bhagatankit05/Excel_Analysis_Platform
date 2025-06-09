// API utility functions for backend integration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  getToken() {
    const tokenData = localStorage.getItem('token');
    if (tokenData) {
      try {
        const parsed = JSON.parse(tokenData);
        return parsed.token || parsed.access_token;
      } catch {
        return tokenData;
      }
    }
    return null;
  }

  // Auth endpoints
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyToken() {
    return this.request('/auth/verify');
  }

  async getUserProfile() {
    return this.request('/auth/profile');
  }

  // Data endpoints
  async saveExcelData(data) {
    return this.request('/data/save-excel', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getExcelHistory(page = 1, limit = 10) {
    return this.request(`/data/excel-history?page=${page}&limit=${limit}`);
  }

  async getExcelData(id) {
    return this.request(`/data/excel/${id}`);
  }

  async getLatestExcelData() {
    return this.request('/data/latest-excel');
  }

  async deleteExcelData(id) {
    return this.request(`/data/excel/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async checkHealth() {
    return this.request('/health');
  }

  // Test connection
  async testConnection() {
    try {
      const response = await this.checkHealth();
      return {
        connected: true,
        status: 'Connected to backend',
        data: response
      };
    } catch (error) {
      return {
        connected: false,
        status: 'Backend connection failed',
        error: error.message
      };
    }
  }
}

export const apiClient = new ApiClient();

// Connection status checker
export const checkBackendConnection = async () => {
  try {
    const result = await apiClient.testConnection();
    console.log('Backend connection status:', result);
    return result;
  } catch (error) {
    console.error('Backend connection check failed:', error);
    return {
      connected: false,
      status: 'Connection check failed',
      error: error.message
    };
  }
};

// Utility function to show connection status
export const showConnectionStatus = async () => {
  const status = await checkBackendConnection();
  
  if (status.connected) {
    console.log('✅ Backend is connected and running');
    console.log('Database status:', status.data?.database || 'Unknown');
  } else {
    console.log('❌ Backend connection failed');
    console.log('Error:', status.error);
    console.log('Using local storage fallback');
  }
  
  return status;
};

export default apiClient;