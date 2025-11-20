import apiClient from './client';

export const authApi = {
  login: (credentials) => apiClient.post('/admin/auth/login', credentials),
  logout: () => apiClient.post('/admin/auth/logout'),
  forgotPassword: (email) => apiClient.post('/admin/auth/forgot-password', { email }),
  resetPassword: (token, password) => apiClient.post('/admin/auth/reset-password', { token, password }),
  getCurrentUser: () => apiClient.get('/admin/auth/me'),
  refreshToken: () => apiClient.post('/admin/auth/refresh'),
};

