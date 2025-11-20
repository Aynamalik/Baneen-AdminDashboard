// Application constants
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Baneen Admin';

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

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
  DRIVERS: '/drivers',
  RIDES: '/rides',
  PAYMENTS: '/payments',
  SUBSCRIPTIONS: '/subscriptions',
  COMPLAINTS: '/complaints',
  SOS: '/sos',
  REPORTS: '/reports',
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

