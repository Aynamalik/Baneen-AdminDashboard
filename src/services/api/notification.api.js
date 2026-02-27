import apiClient from './client';

export const notificationApi = {
  getUnreadCount: () => apiClient.get('/notifications/unread-count'),
  getNotifications: (params = {}) => apiClient.get('/notifications', { params }),
  markAsRead: (id) => apiClient.put(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.put('/notifications/read-all'),
};
