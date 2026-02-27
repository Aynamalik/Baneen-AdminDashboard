import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Grid,
  CircularProgress,
  Avatar,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import PageHeader from '../../components/common/PageHeader';
import { adminApi } from '../../services/api/admin.api';
import { authApi } from '../../services/api/auth.api';
import { updateUser } from '../../store/slices/auth.slice';
import {
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  PhotoCamera as PhotoCameraIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';

const Settings = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.auth);
  const fileInputRef = useRef(null);

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [changePassword, setChangePassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['system-settings'],
    queryFn: adminApi.getSystemSettings,
  });

  const { data: currentUser, refetch: refetchUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: authApi.getCurrentUser,
    onSuccess: (data) => {
      const name = data?.profile?.name || data?.user?.email?.split('@')[0] || 'Admin';
      setProfileName(name);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => adminApi.updateSystemSettings(payload),
    onSuccess: (data) => {
      setMaintenanceMode(data?.maintenanceMode ?? false);
      setEmailNotifications(data?.emailNotifications ?? true);
      queryClient.invalidateQueries(['system-settings']);
    },
  });

  const profileUpdateMutation = useMutation({
    mutationFn: (data) => adminApi.updateAdminProfile(data),
    onSuccess: (data) => {
      dispatch(updateUser({ name: data?.name || profileName }));
      refetchUser();
    },
  });

  const photoUploadMutation = useMutation({
    mutationFn: (formData) => adminApi.uploadAdminProfilePhoto(formData),
    onSuccess: (data) => {
      dispatch(updateUser({ profileImage: data?.profileImage }));
      refetchUser();
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }) =>
      authApi.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      setChangePassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
  });

  useEffect(() => {
    if (settings) {
      setMaintenanceMode(settings.maintenanceMode ?? false);
      setEmailNotifications(settings.emailNotifications ?? true);
    }
  }, [settings]);

  useEffect(() => {
    if (currentUser?.profile?.name) setProfileName(currentUser.profile.name);
  }, [currentUser]);

  const handleSaveSystem = () => {
    updateMutation.mutate({ maintenanceMode });
  };

  const handleSaveNotifications = () => {
    updateMutation.mutate({ emailNotifications });
  };

  const handleSaveProfile = () => {
    if (profileName.trim().length >= 2) {
      profileUpdateMutation.mutate({ name: profileName.trim() });
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('profileImage', file);
      photoUploadMutation.mutate(formData);
    }
  };

  const handleChangePassword = () => {
    const { currentPassword, newPassword, confirmPassword } = changePassword;
    if (!currentPassword || !newPassword || newPassword.length < 8) return;
    if (newPassword !== confirmPassword) return;
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const profileImage = user?.profileImage || currentUser?.user?.profileImage;

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Configure system, profile, and notification preferences"
      />

      {(updateMutation.isSuccess || profileUpdateMutation.isSuccess || changePasswordMutation.isSuccess) && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully.
        </Alert>
      )}
      {(updateMutation.isError || profileUpdateMutation.isError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {updateMutation.error?.message || profileUpdateMutation.error?.message || 'Failed to save'}
        </Alert>
      )}
      {changePasswordMutation.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {changePasswordMutation.error?.message || 'Failed to change password'}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load settings. {error?.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <PersonIcon color="primary" />
              <Typography variant="h6">Profile Settings</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'flex-start' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <IconButton
                  component="label"
                  sx={{ p: 0 }}
                  disabled={photoUploadMutation.isPending}
                >
                  <Avatar
                    src={profileImage}
                    sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}
                  >
                    {user?.name?.charAt(0) || 'A'}
                  </Avatar>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'primary.main',
                      color: 'white',
                      borderRadius: '50%',
                      p: 0.5,
                    }}
                  >
                    <PhotoCameraIcon fontSize="small" />
                  </Box>
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                </IconButton>
                <Typography variant="caption" color="text.secondary">
                  {photoUploadMutation.isPending ? 'Uploading...' : 'Change photo'}
                </Typography>
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <TextField
                  fullWidth
                  label="Name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  size="small"
                  sx={{ mb: 2, maxWidth: 400 }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  value={currentUser?.user?.email || user?.email || '—'}
                  InputProps={{ readOnly: true }}
                  size="small"
                  sx={{ mb: 2, maxWidth: 400 }}
                />
                <Button
                  variant="contained"
                  onClick={handleSaveProfile}
                  disabled={profileUpdateMutation.isPending || profileName.trim().length < 2}
                >
                  {profileUpdateMutation.isPending ? 'Saving...' : 'Save Profile'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Change Password */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <LockIcon color="primary" />
              <Typography variant="h6">Change Password</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
              <TextField
                fullWidth
                type={showCurrentPassword ? 'text' : 'password'}
                label="Current Password"
                value={changePassword.currentPassword}
                onChange={(e) =>
                  setChangePassword((p) => ({ ...p, currentPassword: e.target.value }))
                }
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        edge="end"
                        aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                      >
                        {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                type={showNewPassword ? 'text' : 'password'}
                label="New Password"
                value={changePassword.newPassword}
                onChange={(e) =>
                  setChangePassword((p) => ({ ...p, newPassword: e.target.value }))
                }
                size="small"
                helperText="At least 8 characters"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      >
                        {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirm New Password"
                value={changePassword.confirmPassword}
                onChange={(e) =>
                  setChangePassword((p) => ({ ...p, confirmPassword: e.target.value }))
                }
                size="small"
                error={
                  changePassword.newPassword !== '' &&
                  changePassword.confirmPassword !== '' &&
                  changePassword.newPassword !== changePassword.confirmPassword
                }
                helperText={
                  changePassword.newPassword !== changePassword.confirmPassword &&
                  changePassword.confirmPassword
                    ? 'Passwords do not match'
                    : ''
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleChangePassword}
                disabled={
                  changePasswordMutation.isPending ||
                  !changePassword.currentPassword ||
                  !changePassword.newPassword ||
                  changePassword.newPassword.length < 8 ||
                  changePassword.newPassword !== changePassword.confirmPassword
                }
              >
                {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <SettingsIcon color="primary" />
              <Typography variant="h6">System Settings</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {isLoading ? (
              <CircularProgress size={24} />
            ) : (
              <>
                <FormControlLabel
                  control={
                    <Switch
                      checked={maintenanceMode}
                      onChange={(e) => setMaintenanceMode(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Maintenance Mode"
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                  When enabled, the platform will be temporarily unavailable to users.
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleSaveSystem}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save System Settings'}
                </Button>
              </>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <NotificationsIcon color="primary" />
              <Typography variant="h6">Notifications</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {isLoading ? (
              <CircularProgress size={24} />
            ) : (
              <>
                <FormControlLabel
                  control={
                    <Switch
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Email Notifications"
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                  Receive email alerts for SOS alerts, complaints, and driver approvals.
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleSaveNotifications}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Notification Settings'}
                </Button>
              </>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <SecurityIcon color="primary" />
              <Typography variant="h6">API Configuration</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              API endpoints and keys are configured via environment variables. Contact your
              administrator for changes.
            </Typography>
            <TextField
              fullWidth
              label="API Base URL"
              value={import.meta.env.VITE_API_BASE_URL || 'Not configured'}
              InputProps={{ readOnly: true }}
              size="small"
              sx={{ maxWidth: 500 }}
            />
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default Settings;
