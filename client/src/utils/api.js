import axios from 'axios';

// Determine the API base URL based on the current environment
const getBaseUrl = () => {
  // Check for environment variable first
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Check if we're on Vercel
  if (window.location.hostname.includes('vercel.app')) {
    // Just use the base path for API requests
    return '/api';
  }
  
  // Default to Render deployment
  return 'https://plant-nursery-api.onrender.com/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  },
  // Add withCredentials to ensure cookies are sent with requests
  withCredentials: true
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api; 