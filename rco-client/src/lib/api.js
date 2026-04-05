import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
  // This line logs the URL to your console so we can see what Vite is actually seeing
  baseURL: import.meta.env.VITE_API_URL || 'https://real-time-collaborative-ide.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

console.log("Current API Base URL:", api.defaults.baseURL);
// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rco_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network / server unavailable
    if (!error.response) {
      toast.error('Unable to reach server. Please check your network or try again later.');
      return Promise.reject(new Error('Network Error'));
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('rco_token');
      localStorage.removeItem('rco_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
