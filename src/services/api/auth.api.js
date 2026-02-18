import apiClient from './client';

export const authApi = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  logout: () => apiClient.post('/auth/logout'),
  forgotPassword: (phone) => apiClient.post('/auth/forgot-password', { phone }),
  resetPassword: (token, password) => apiClient.post('/auth/reset-password', { token, password }),
  getCurrentUser: () => apiClient.get('/auth/me'),
  refreshToken: () => apiClient.post('/auth/refresh-token'),
};

