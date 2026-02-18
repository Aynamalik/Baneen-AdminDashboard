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
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import { authApi } from '../../services/api/auth.api';
import { ROUTES } from '../../utils/constants';

const schema = yup.object().shape({
  phone: yup
    .string()
    .matches(/^(\+92|92|0)?[3][0-9]{9}$/, 'Please enter a valid Pakistani phone number')
    .required('Phone number is required'),
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
      await authApi.forgotPassword(data.phone);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
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
          Enter your phone number to receive a password reset OTP
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
            Password reset OTP has been sent to your phone number.
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
            label="Phone Number"
            type="tel"
            margin="normal"
            {...register('phone')}
            error={!!errors.phone}
            helperText={errors.phone?.message}
            autoComplete="tel"
            placeholder="03XXXXXXXXX"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Send OTP'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Link
              component={RouterLink}
              to={ROUTES.LOGIN}
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

