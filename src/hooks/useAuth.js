import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure, logout as logoutAction } from '../store/slices/auth.slice';
import { authApi } from '../services/api/auth.api';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);


  const login = async (credentials) => {
    try {
      dispatch(loginStart());
      const response = await authApi.login(credentials);
    
      const userData = {
        ...response.user,
        name: response.profile?.name || response.user?.email?.split('@')[0] || 'Admin',
        profile: response.profile,
      };
      dispatch(loginSuccess({
        user: userData,
        token: response.accessToken,
      }));
      return { success: true };
    } catch (error) {
      // Error is already formatted by interceptor
      const errorMessage = error.data?.message || error.message || 'Login failed';
      dispatch(loginFailure(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(logoutAction());
      navigate('/login');
    }
  };

  return {
    ...auth,
    login,
    logout,
  };
};

