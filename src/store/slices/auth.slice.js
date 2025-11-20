import { createSlice } from '@reduxjs/toolkit';
import { storage } from '../../utils/storage';
import { STORAGE_KEYS } from '../../utils/constants';

const initialState = {
  user: storage.get(STORAGE_KEYS.USER) || null,
  token: storage.get(STORAGE_KEYS.TOKEN) || null,
  isAuthenticated: !!storage.get(STORAGE_KEYS.TOKEN),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      
      // Store in localStorage
      storage.set(STORAGE_KEYS.USER, action.payload.user);
      storage.set(STORAGE_KEYS.TOKEN, action.payload.token);
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      
      // Clear localStorage
      storage.remove(STORAGE_KEYS.USER);
      storage.remove(STORAGE_KEYS.TOKEN);
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      storage.set(STORAGE_KEYS.USER, state.user);
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;

