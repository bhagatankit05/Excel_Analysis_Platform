/* ------------------------------------------------------------------ */
/*  API utility functions for backend integration                     */
/* ------------------------------------------------------------------ */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /* --------------------------- core ------------------------------- */
  async request(endpoint, options = {}) {
    const url   = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const {
      headers: optHeaders = {},
      withCredentials,
      ...rest
    } = options;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...optHeaders
      },
      ...(withCredentials && { credentials: 'include' }),
      ...rest
    };

    try {
      const res = await fetch(url, config);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP error! status: ${res.status}`);
      }

      if (res.status === 204) return null; // No Content
      return await res.json();
    } catch (err) {
      console.error('API request failed:', err);
      throw err;
    }
  }

  /* --------------------- token utilities ------------------------- */
  getToken() {
    const raw = localStorage.getItem('token');
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      return parsed.token || parsed.access_token;
    } catch {
      return raw;
    }
  }

  /* --------------------- auth endpoints -------------------------- */
  login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      withCredentials: true
    });
  }

  register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      withCredentials: true
    });
  }

  verifyToken()    { return this.request('/auth/verify',  { withCredentials: true }); }
  getUserProfile() { return this.request('/auth/profile', { withCredentials: true }); }

  /* --------------------- data endpoints -------------------------- */
  saveExcelData(data) {
    return this.request('/data/save-excel', {
      method: 'POST',
      body: JSON.stringify(data),
      withCredentials: true
    });
  }

  getExcelHistory(page = 1, limit = 10) {
    return this.request(`/data/excel-history?page=${page}&limit=${limit}`, {
      withCredentials: true
    });
  }

  getExcelData(id)         { return this.request(`/data/excel/${id}`,       { withCredentials: true }); }
  getLatestExcelData()     { return this.request('/data/latest-excel',      { withCredentials: true }); }

  deleteExcelData(id)      { return this.request(`/data/excel/${id}`,       { method: 'DELETE', withCredentials: true }); }

  /* ------------------- activity endpoints ------------------------ */
  addActivity(activityData) {
    return this.request('/activities', {
      method: 'POST',
      body: JSON.stringify(activityData),
      withCredentials: true
    });
  }

  getActivities(params = {}) {
    const q = new URLSearchParams(params).toString();
    const path = q ? `/activities?${q}` : '/activities';
    return this.request(path, { withCredentials: true });
  }

  clearActivities(userId = null) {
    return this.request('/activities', {
      method: 'DELETE',
      body: userId ? JSON.stringify({ userId }) : null,
      withCredentials: true
    });
  }

  /* ------------------ health / diagnostics ----------------------- */
  checkHealth() { return this.request('/health'); }

  async testConnection() {
    try {
      const data = await this.checkHealth();
      return { connected: true, status: 'Connected', data };
    } catch (err) {
      return { connected: false, status: 'Backend connection failed', error: err.message };
    }
  }
}

export const apiClient = new ApiClient();

/* ---------------- convenience helpers --------------------------- */
export const checkBackendConnection = async () => {
  try {
    const res = await apiClient.testConnection();
    console.log('Backend connection status:', res);
    return res;
  } catch (err) {
    console.error('Backend connection check failed:', err);
    return { connected: false, status: 'Connection check failed', error: err.message };
  }
};

export const showConnectionStatus = async () => {
  const status = await checkBackendConnection();
  if (status.connected) {
    console.log('✅ Backend is connected');
    console.log('Database status:', status.data?.database || 'Unknown');
  } else {
    console.log('❌ Backend connection failed:', status.error);
  }
  return status;
};

export default apiClient;
