import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';
import { storage } from '../../utils/storage';
import { STORAGE_KEYS } from '../../utils/constants';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = storage.get(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Backend returns { success, message, data }
    // Return the data property if it exists, otherwise return the full response
    if (response.data && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    // Handle error response from backend
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    const errorData = {
      message: errorMessage,
      errors: error.response?.data?.errors || null,
      status: error.response?.status || 500,
    };
    
    if (error.response?.status === 401) {
      // Handle unauthorized - clear token and redirect to login
      storage.remove(STORAGE_KEYS.TOKEN);
      storage.remove(STORAGE_KEYS.USER);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Create a custom error object that includes the backend error message
    const customError = new Error(errorMessage);
    customError.response = error.response;
    customError.data = errorData;
    return Promise.reject(customError);
  }
);

export default apiClient;

