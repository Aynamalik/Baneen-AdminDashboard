import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/common/PageHeader';
import { adminApi } from '../../services/api/admin.api';
import { ROUTES } from '../../utils/constants';
import {
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Call as CallIcon,
  DirectionsCar as DirectionsCarIcon,
  AccessTime as AccessTimeIcon,
  MyLocation as MyLocationIcon,
} from '@mui/icons-material';

const ActiveAlerts = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [resolveDialog, setResolveDialog] = useState({
    open: false,
    resolution: '',
    responseNotes: '',
    policeNotified: false,
    ambulanceNotified: false,
  });

  // Fetch active SOS alerts with auto-refresh
  const {
    data: activeAlertsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['active-sos-alerts'],
    queryFn: () => adminApi.getActiveSOSAlerts(),
    refetchInterval: 30000, // Refetch every 30 seconds for active alerts
  });

  // Resolve SOS alert mutation
  const resolveMutation = useMutation({
    mutationFn: (resolutionData) =>
      adminApi.resolveSOSAlert(selectedAlert._id, resolutionData),
    onSuccess: () => {
      queryClient.invalidateQueries(['active-sos-alerts']);
      queryClient.invalidateQueries(['sos-alerts']);
      setResolveDialog({ open: false, resolution: '', responseNotes: '', policeNotified: false, ambulanceNotified: false });
      setSelectedAlert(null);
    },
  });

  // Auto-refresh on component mount
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  const handleResolveAlert = (alert) => {
    setSelectedAlert(alert);
    setResolveDialog({
      open: true,
      resolution: '',
      responseNotes: '',
      policeNotified: false,
      ambulanceNotified: false,
    });
  };

  const handleResolveSubmit = () => {
    if (selectedAlert && resolveDialog.resolution.trim()) {
      resolveMutation.mutate({
        resolution: resolveDialog.resolution,
        responseNotes: resolveDialog.responseNotes,
        policeNotified: resolveDialog.policeNotified,
        ambulanceNotified: resolveDialog.ambulanceNotified,
      });
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <ErrorIcon fontSize="large" />;
      case 'medium':
        return <WarningIcon fontSize="large" />;
      default:
        return <WarningIcon fontSize="large" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const alertTime = new Date(dateString);
    const diffInMinutes = Math.floor((now - alertTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleCallUser = (phone) => {
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    }
  };

  const handleViewLocation = (alert) => {
    if (alert.location) {
      // You could integrate with Google Maps here
      const { latitude, longitude } = alert.location;
      window.open(`https://maps.google.com/?q=${latitude},${longitude}`, '_blank');
    }
  };

  if (error) {
    return (
      <>
        <Alert severity="error" sx={{ mt: 2 }}>
          Failed to load active SOS alerts. Please try again.
        </Alert>
      </>
    );
  }

  const activeAlerts = activeAlertsData?.data || [];

  return (
    <>
      <PageHeader
        title="Active SOS Alerts"
        subtitle={`${activeAlerts.length} active emergency situation${activeAlerts.length !== 1 ? 's' : ''}`}
        icon={<ErrorIcon />}
        action={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(ROUTES.SOS)}
          >
            All Alerts
          </Button>
        }
      />

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : activeAlerts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No Active Emergency Alerts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            All emergency situations have been resolved.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {activeAlerts.map((alert) => (
            <Grid item xs={12} md={6} lg={4} key={alert._id}>
              <Card sx={{ height: '100%', border: '2px solid', borderColor: 'error.main' }}>
                <CardContent>
                  {/* Alert Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getSeverityIcon(alert.severity)}
                      <Box>
                        <Typography variant="h6" color="error">
                          EMERGENCY ALERT
                        </Typography>
                        <Chip
                          label={alert.severity.toUpperCase()}
                          color={getSeverityColor(alert.severity)}
                          size="small"
                        />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {getTimeAgo(alert.createdAt)}
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* User Information */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'error.main' }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {alert.userId?.name || 'Unknown User'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {alert.userId?.phone || 'No phone number'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Location */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOnIcon fontSize="small" />
                      Location
                    </Typography>
                    <Typography variant="body1">
                      {alert.location?.address || 'Location not available'}
                    </Typography>
                  </Box>

                  {/* Ride Information */}
                  {alert.rideId && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DirectionsCarIcon fontSize="small" />
                        Active Ride
                      </Typography>
                      <Typography variant="body1">
                        Ride #{alert.rideId._id.slice(-8)}
                      </Typography>
                    </Box>
                  )}

                  {/* Emergency Contacts */}
                  {alert.userId?.emergencyContacts && alert.userId.emergencyContacts.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Emergency Contacts:
                      </Typography>
                      <List dense>
                        {alert.userId.emergencyContacts.map((contact, index) => (
                          <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <PhoneIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary={contact.name}
                              secondary={contact.phone}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleResolveAlert(alert)}
                      sx={{ flex: 1 }}
                    >
                      Resolve
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<CallIcon />}
                      onClick={() => handleCallUser(alert.userId?.phone)}
                      disabled={!alert.userId?.phone}
                    >
                      Call
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<MyLocationIcon />}
                      onClick={() => handleViewLocation(alert)}
                    >
                      Location
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Resolve Alert Dialog */}
      <Dialog
        open={resolveDialog.open}
        onClose={() => setResolveDialog({ open: false, resolution: '', responseNotes: '', policeNotified: false, ambulanceNotified: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main' }}>
          Resolve Emergency Alert
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This is an active emergency situation. Please ensure appropriate response measures have been taken.
          </Alert>

          {selectedAlert && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="error.contrastText">
                Alert Details:
              </Typography>
              <Typography variant="body2" color="error.contrastText">
                User: {selectedAlert.userId?.name} | Location: {selectedAlert.location?.address}
              </Typography>
            </Box>
          )}

          <TextField
            autoFocus
            margin="dense"
            label="Resolution Summary"
            fullWidth
            multiline
            rows={3}
            value={resolveDialog.resolution}
            onChange={(e) => setResolveDialog(prev => ({ ...prev, resolution: e.target.value }))}
            placeholder="Describe how this emergency was handled..."
            sx={{ mb: 2, mt: 1 }}
          />

          <TextField
            margin="dense"
            label="Response Details"
            fullWidth
            multiline
            rows={2}
            value={resolveDialog.responseNotes}
            onChange={(e) => setResolveDialog(prev => ({ ...prev, responseNotes: e.target.value }))}
            placeholder="Details about police/ambulance response, actions taken..."
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>Police Notified</InputLabel>
              <Select
                value={resolveDialog.policeNotified}
                label="Police Notified"
                onChange={(e) => setResolveDialog(prev => ({ ...prev, policeNotified: e.target.value }))}
              >
                <MenuItem value={false}>No</MenuItem>
                <MenuItem value={true}>Yes</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ flex: 1 }}>
              <InputLabel>Ambulance Notified</InputLabel>
              <Select
                value={resolveDialog.ambulanceNotified}
                label="Ambulance Notified"
                onChange={(e) => setResolveDialog(prev => ({ ...prev, ambulanceNotified: e.target.value }))}
              >
                <MenuItem value={false}>No</MenuItem>
                <MenuItem value={true}>Yes</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setResolveDialog({ open: false, resolution: '', responseNotes: '', policeNotified: false, ambulanceNotified: false })}
          >
            Cancel
          </Button>
          <Button
            onClick={handleResolveSubmit}
            variant="contained"
            color="error"
            disabled={!resolveDialog.resolution.trim() || resolveMutation.isPending}
          >
            {resolveMutation.isPending ? <CircularProgress size={20} /> : 'Resolve Emergency'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ActiveAlerts;