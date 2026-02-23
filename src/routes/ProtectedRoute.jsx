import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Box, CircularProgress, Typography } from '@mui/material';
import MainLayout from '../components/layout/MainLayout';
import { authApi } from '../services/api/auth.api';
import { loginSuccess, logout } from '../store/slices/auth.slice';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';

const ProtectedRoute = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const token = storage.get(STORAGE_KEYS.TOKEN);
      const user = storage.get(STORAGE_KEYS.USER);
      
      // If no token, skip verification
      if (!token) {
        setCheckingAuth(false);
        return;
      }
      
      // If already authenticated, skip verification
      if (isAuthenticated) {
        setCheckingAuth(false);
        return;
      }
      
      // Verify token is still valid
      if (token && user) {
        try {
          const response = await authApi.getCurrentUser();
          const userData = {
            ...response.user,
            name: response.profile?.name || response.user?.email?.split('@')[0] || 'Admin',
            profile: response.profile,
          };
          dispatch(loginSuccess({
            user: userData,
            token: token,
          }));
        } catch (error) {
          // Token is invalid or backend is not available
          console.error('Auth verification failed:', error);
          // Only clear token if it's a 401 (unauthorized), not if it's a network error
          if (error.response?.status === 401 || error.data?.status === 401) {
            dispatch(logout());
          } else {
            // Network error or backend unavailable - keep token but don't authenticate
            // This allows the app to work even if backend is temporarily unavailable
            console.warn('Backend unavailable, but keeping token for retry');
          }
        }
      }
      setCheckingAuth(false);
    };

    verifyAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- isAuthenticated excluded to avoid infinite loop
  }, [dispatch]);

  if (checkingAuth || loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

export default ProtectedRoute;

