import { useState, useEffect } from 'react';
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
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/common/PageHeader';
import { adminApi } from '../../services/api/admin.api';
import { Settings as SettingsIcon, Notifications as NotificationsIcon, Security as SecurityIcon } from '@mui/icons-material';

const Settings = () => {
  const queryClient = useQueryClient();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['system-settings'],
    queryFn: adminApi.getSystemSettings,
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => adminApi.updateSystemSettings(payload),
    onSuccess: (data) => {
      setMaintenanceMode(data?.maintenanceMode ?? false);
      setEmailNotifications(data?.emailNotifications ?? true);
      queryClient.invalidateQueries(['system-settings']);
    },
  });

  // Sync local state when settings load
  useEffect(() => {
    if (settings) {
      setMaintenanceMode(settings.maintenanceMode ?? false);
      setEmailNotifications(settings.emailNotifications ?? true);
    }
  }, [settings]);

  const handleSaveSystem = () => {
    updateMutation.mutate({ maintenanceMode });
  };

  const handleSaveNotifications = () => {
    updateMutation.mutate({ emailNotifications });
  };

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Configure system and notification preferences"
      />

      {updateMutation.isSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully.
        </Alert>
      )}
      {updateMutation.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {updateMutation.error?.message || 'Failed to save settings'}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load settings. {error?.message}
        </Alert>
      )}

      <Grid container spacing={3}>
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
              API endpoints and keys are configured via environment variables. Contact your administrator for changes.
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
