import axios from 'axios';

// Define the base URL for your API.
// Replace with your actual backend URL. Use environment variables in a real app.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';

// Create an Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token from localStorage
api.interceptors.request.use(
  (config) => {
    // Retrieve the token from local storage
    const token = localStorage.getItem('token'); // Use the same key as AuthContext

    if (token) {
      // Add the Authorization header
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

// Optional: Add a response interceptor for handling common responses/errors (like 401)
// This duplicates logic from AuthContext, consider centralizing if needed
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized access - 401 (detected in api.js)');
      // Potentially trigger logout or redirect, but AuthContext might already handle this
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    // Retrieve the token from local storage (or wherever it's stored)
    const token = localStorage.getItem('authToken'); // Adjust the key if needed

    if (token) {
      // Add the Authorization header
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

// Optional: Add a response interceptor for handling common responses/errors
api.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Example: Handle 401 Unauthorized errors (e.g., redirect to login)
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized access - 401');
      // Potentially clear token and redirect to login page
      // localStorage.removeItem('authToken');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;