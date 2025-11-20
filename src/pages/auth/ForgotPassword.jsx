import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import { authApi } from '../../services/api/auth.api';
import { ROUTES } from '../../utils/constants';

const schema = yup.object().shape({
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.forgotPassword(data.email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Forgot Password
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter your email to receive a password reset link
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success ? (
        <Box>
          <Alert severity="success" sx={{ mb: 2 }}>
            Password reset link has been sent to your email.
          </Alert>
          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate(ROUTES.LOGIN)}
            sx={{ mt: 2 }}
          >
            Back to Login
          </Button>
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            autoComplete="email"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Link
              href={ROUTES.LOGIN}
              variant="body2"
              sx={{ textDecoration: 'none' }}
            >
              Back to Login
            </Link>
          </Box>
        </Box>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;

