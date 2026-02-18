import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Checkbox,
  FormControlLabel,
  Link,
  CircularProgress,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../utils/constants';

const schema = yup.object().shape({
  emailOrPhone: yup
    .string()
    .required('Email or phone is required')
    .test('email-or-phone', 'Must be a valid email or phone number', function(value) {
      if (!value) return false;
      // Check if it's an email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      // Check if it's a phone (Pakistani format)
      const phoneRegex = /^(\+92|92|0)?[0-9]{10}$/;
      return emailRegex.test(value) || phoneRegex.test(value.replace(/\s+/g, ''));
    }),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, error, loading } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    // Determine if input is email or phone
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(data.emailOrPhone);
    
    const credentials = {
      password: data.password,
      ...(isEmail ? { email: data.emailOrPhone } : { phone: data.emailOrPhone.replace(/\s+/g, '') }),
    };
    
    const result = await login(credentials);
    if (result.success) {
      navigate(ROUTES.DASHBOARD);
    }
  };

  return (
    <AuthLayout>
      <Box
        component="img"
        src="/baneen-logo.png"
        alt="Baneen - female journeys"
        sx={{
          display: 'block',
          mx: 'auto',
          mb: 2,
          height: 150,
          objectFit: 'contain',
        }}
      />
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome Back
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sign in to Baneen Admin Panel
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          fullWidth
          label="Email or Phone"
          type="text"
          margin="normal"
          {...register('emailOrPhone')}
          error={!!errors.emailOrPhone}
          helperText={errors.emailOrPhone?.message || 'Enter your email or phone number'}
          autoComplete="username"
          placeholder="admin@example.com or 03001234567"
        />

        <TextField
          fullWidth
          label="Password"
          type="password"
          margin="normal"
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password?.message}
          autoComplete="current-password"
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
            }
            label="Remember me"
          />
          <Link
            component={RouterLink}
            to={ROUTES.FORGOT_PASSWORD}
            variant="body2"
            sx={{ textDecoration: 'none' }}
          >
            Forgot password?
          </Link>
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Sign In'}
        </Button>
      </Box>
    </AuthLayout>
  );
};

export default Login;

