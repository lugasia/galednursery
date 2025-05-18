import axios from 'axios';

// GitHub raw content URL for data.json
const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/lugasia/galednursery/main/data.json';

// Function to fetch data from GitHub
export const fetchDataFromGitHub = async () => {
  try {
    const response = await axios.get(GITHUB_RAW_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching data from GitHub:', error);
    throw error;
  }
};

// Keep the existing API configuration for other endpoints
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://galednursery.vercel.app';
  }
  return 'http://localhost:5000';
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