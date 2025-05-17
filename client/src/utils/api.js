import axios from 'axios';

// Determine the API base URL based on the current environment
const getBaseUrl = () => {
  // In production (Vercel or Render), use relative path
  if (process.env.NODE_ENV === 'production') {
    return '';
  }
  
  // In development, use localhost
  return 'http://localhost:5001';
};

// הערה: הסרנו את הפונקציה handleApiResponse כי היא לא בשימוש
// והיא גורמת לשגיאת ESLint בזמן הבנייה

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

// Add a response interceptor to handle errors and ensure consistent data format
api.interceptors.response.use(
  (response) => {
    // For successful responses, ensure data is in expected format
    if (!response.data) {
      console.warn('API response has no data property');
      response.data = [];
    }
    return response;
  },
  (error) => {
    // For error responses, provide a consistent error format
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api; 