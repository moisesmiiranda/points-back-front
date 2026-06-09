import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Attach token from localStorage for protected requests
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('app_token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
});

// Handle 401 centrally
api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      try {
        localStorage.removeItem('app_token');
      } catch (e) {}
      // Let callers handle navigation to login
    }
    return Promise.reject(error);
  },
);

export default api;
