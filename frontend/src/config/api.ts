import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ecorwanda-conservation-portal.onrender.com/api';

console.log('API Base URL:', API_BASE_URL); // For debugging

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('eco-user');
    if (user) {
      const { token } = JSON.parse(user);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('eco-user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api; 