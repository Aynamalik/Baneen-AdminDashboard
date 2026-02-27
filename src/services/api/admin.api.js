import apiClient from './client';

export const adminApi = {
  // Dashboard
  getDashboardStats: () => apiClient.get('/admin/dashboard'),

  // User Management
  getUsers: (params = {}) => apiClient.get('/admin/users', { params }),
  createUser: (userData) => apiClient.post('/admin/users', userData),
  getUserDetails: (userId) => apiClient.get(`/admin/users/${userId}`),
  verifyUser: (userId) => apiClient.put(`/admin/users/${userId}/verify`),
  blockUser: (userId) => apiClient.put(`/admin/users/${userId}/block`),
  unblockUser: (userId) => apiClient.put(`/admin/users/${userId}/unblock`),
  deleteUser: (userId) => apiClient.delete(`/admin/users/${userId}`),

  // Driver Management
  getDrivers: (params = {}) => apiClient.get('/admin/drivers', { params }),
  getDriverDetails: (driverId) => apiClient.get(`/admin/drivers/${driverId}`),
  getPendingDrivers: () => apiClient.get('/admin/drivers/pending'),
  approveDriver: (driverId) => apiClient.put(`/admin/drivers/${driverId}/approve`),
  rejectDriver: (driverId) => apiClient.put(`/admin/drivers/${driverId}/reject`),

  // Ride Management
  getRides: (params = {}) => apiClient.get('/admin/rides', { params }),
  getActiveRides: () => apiClient.get('/admin/rides/active'),
  getRideDetails: (rideId) => apiClient.get(`/admin/rides/${rideId}`),
  cancelRide: (rideId, reason) => apiClient.put(`/admin/rides/${rideId}/cancel`, { reason }),

  // Reports
  getRideReports: (params = {}) => apiClient.get('/admin/reports/rides', { params }),
  getEarningsReports: (params = {}) => apiClient.get('/admin/reports/earnings', { params }),
  getUserReports: (params = {}) => apiClient.get('/admin/reports/users', { params }),
  getDriverReports: (params = {}) => apiClient.get('/admin/reports/drivers', { params }),

  // Subscription Management
  getSubscriptionPlans: () => apiClient.get('/admin/subscriptions/plans'),
  createSubscriptionPlan: (planData) => apiClient.post('/admin/subscriptions/plans', planData),
  updateSubscriptionPlan: (planId, planData) => apiClient.put(`/admin/subscriptions/plans/${planId}`, planData),
  deleteSubscriptionPlan: (planId) => apiClient.delete(`/admin/subscriptions/plans/${planId}`),

  // System Stats
  getSystemStats: () => apiClient.get('/admin/system/stats'),

  // Complaint Management
  getComplaints: (params = {}) => apiClient.get('/admin/complaints', { params }),
  getComplaintDetails: (complaintId) => apiClient.get(`/admin/complaints/${complaintId}`),
  resolveComplaint: (complaintId, resolutionData) => apiClient.put(`/admin/complaints/${complaintId}/resolve`, resolutionData),

  // SOS Alert Management
  getSOSAlerts: (params = {}) => apiClient.get('/admin/sos/alerts', { params }),
  getActiveSOSAlerts: () => apiClient.get('/admin/sos/alerts/active'),
  getSOSAlertDetails: (alertId) => apiClient.get(`/admin/sos/alerts/${alertId}`),
  resolveSOSAlert: (alertId, resolutionData) => apiClient.put(`/admin/sos/alerts/${alertId}/resolve`, resolutionData),

  // System Settings
  getSystemSettings: () => apiClient.get('/admin/system/settings'),
  updateSystemSettings: (settings) => apiClient.put('/admin/system/settings', settings),

  // Admin Profile
  updateAdminProfile: (data) => apiClient.put('/admin/profile', data),
  uploadAdminProfilePhoto: (formData) => apiClient.post('/admin/profile/photo', formData),

  // Chatbot Monitoring
  getChatbotConversations: (params = {}) => apiClient.get('/admin/chatbot/conversations', { params }),
  getChatbotAnalytics: (params = {}) => apiClient.get('/admin/chatbot/analytics', { params }),

  // Payment Management (under /payments route, admin sub-routes)
  getPaymentStats: (params = {}) => apiClient.get('/payments/admin/stats', { params }),
  getAllPayments: (params = {}) => apiClient.get('/payments/admin/all', { params }),
  processRefund: (data) => apiClient.post('/payments/admin/refund', data),
};