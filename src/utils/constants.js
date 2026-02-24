// Application constants
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Baneen Admin';

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'baneen_admin_token',
  USER: 'baneen_admin_user',
};

// Route Paths
export const ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  USERS: '/users',
  USERS_CREATE: '/users/create',
  DRIVERS: '/drivers',
  RIDES: '/rides',
  RIDES_ACTIVE: '/rides/active',
  RIDE_DETAILS: (id) => `/rides/${id}`,
  DRIVERS_PENDING: '/drivers/pending',
  PAYMENTS: '/payments',
  SUBSCRIPTIONS: '/subscriptions',
  SUBSCRIPTIONS_PLAN_EDIT: (id) => `/subscriptions/plans/${id}`,
  REPORTS: '/reports',
  COMPLAINTS: '/complaints',
  SOS: '/sos',
  SOS_ALERT_DETAILS: (id) => `/sos/${id}`,
  CHATBOT: '/chatbot',
  SETTINGS: '/settings',
};

// Status Types
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  BLOCKED: 'blocked',
  VERIFIED: 'verified',
  UNVERIFIED: 'unverified',
};

