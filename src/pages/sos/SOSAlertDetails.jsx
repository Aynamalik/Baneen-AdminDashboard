import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Checkbox,
  Link,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/common/PageHeader';
import { adminApi } from '../../services/api/admin.api';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  LocalHospital as LocalHospitalIcon,
  LocalPolice as LocalPoliceIcon,
} from '@mui/icons-material';

const SOSAlertDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [resolveDialog, setResolveDialog] = useState({
    open: false,
    responseNotes: '',
    policeNotified: false,
    ambulanceNotified: false,
  });

  const {
    data: alert,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['sos-alert-details', id],
    queryFn: () => adminApi.getSOSAlertDetails(id),
    enabled: !!id,
  });

  const resolveMutation = useMutation({
    mutationFn: (resolutionData) => adminApi.resolveSOSAlert(id, resolutionData),
    onSuccess: () => {
      queryClient.invalidateQueries(['sos-alert-details', id]);
      queryClient.invalidateQueries(['sos-alerts']);
      queryClient.invalidateQueries(['active-sos-alerts']);
      setResolveDialog({ open: false, responseNotes: '', policeNotified: false, ambulanceNotified: false });
    },
  });

  const handleResolve = () => {
    setResolveDialog({
      open: true,
      responseNotes: '',
      policeNotified: false,
      ambulanceNotified: false,
    });
  };

  const handleResolveSubmit = () => {
    resolveMutation.mutate({
      resolution: 'Resolved via admin panel',
      responseNotes: resolveDialog.responseNotes,
      policeNotified: resolveDialog.policeNotified,
      ambulanceNotified: resolveDialog.ambulanceNotified,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'error';
      case 'resolved': return 'success';
      case 'false-alarm': return 'warning';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const mapUrl = alert?.location?.latitude && alert?.location?.longitude
    ? `https://www.google.com/maps?q=${alert.location.latitude},${alert.location.longitude}`
    : null;

  if (isLoading) {
    return (
      <>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (error || !alert) {
    return (
      <>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error?.message || 'SOS alert not found'}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/sos')}>
          Back to Alerts
        </Button>
      </>
    );
  }

  const user = alert.userId;

  return (
    <>
      <PageHeader
        title="SOS Alert Details"
        subtitle={`Alert #${alert._id?.slice(-6) || '—'}`}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/sos')}>
              Back
            </Button>
            {alert.status === 'active' && (
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={handleResolve}
              >
                Resolve Alert
              </Button>
            )}
          </Box>
        }
      />

      <Grid container spacing={3}>
        {/* Status & Severity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip
                label={alert.status?.toUpperCase()}
                color={getStatusColor(alert.status)}
                size="small"
              />
              <Chip
                label={alert.severity || 'high'}
                color={getSeverityColor(alert.severity)}
                size="small"
              />
              <Chip label={alert.alertType || 'manual'} variant="outlined" size="small" />
              <Typography variant="body2" color="text.secondary">
                Created: {formatDate(alert.createdAt)}
              </Typography>
              {alert.resolvedAt && (
                <Typography variant="body2" color="text.secondary">
                  Resolved: {formatDate(alert.resolvedAt)}
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* User Info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon /> User Information
              </Typography>
              <Divider sx={{ my: 2 }} />
              {user ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography><strong>Name:</strong> {user.name || '—'}</Typography>
                  <Typography><strong>Email:</strong> {user.email || '—'}</Typography>
                  <Typography>
                    <strong>Phone:</strong>{' '}
                    {user.phone ? (
                      <Link href={`tel:${user.phone}`} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                        <PhoneIcon fontSize="small" /> {user.phone}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </Typography>
                </Box>
              ) : (
                <Typography color="text.secondary">User data not available</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Location */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon /> Location
              </Typography>
              <Divider sx={{ my: 2 }} />
              {alert.location ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography><strong>Address:</strong> {alert.location.address || '—'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Coordinates: {alert.location.latitude?.toFixed(5)}, {alert.location.longitude?.toFixed(5)}
                  </Typography>
                  {mapUrl && (
                    <Button
                      component={Link}
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<LocationOnIcon />}
                      sx={{ alignSelf: 'flex-start', mt: 1 }}
                    >
                      View on Google Maps
                    </Button>
                  )}
                </Box>
              ) : (
                <Typography color="text.secondary">Location not available</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Emergency Contacts */}
        {alert.emergencyContacts?.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Emergency Contacts
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {alert.emergencyContacts.map((ec, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography><strong>{ec.name}:</strong></Typography>
                      <Link href={`tel:${ec.phone}`} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                        <PhoneIcon fontSize="small" /> {ec.phone}
                      </Link>
                      {ec.notified && <Chip label="Notified" color="success" size="small" />}
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Response */}
        {alert.response && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Response Details
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {alert.response.policeNotified && (
                    <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalPoliceIcon color="primary" /> Police notified
                    </Typography>
                  )}
                  {alert.response.ambulanceNotified && (
                    <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalHospitalIcon color="error" /> Ambulance notified
                    </Typography>
                  )}
                  {alert.response.responseNotes && (
                    <Typography><strong>Notes:</strong> {alert.response.responseNotes}</Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Notes */}
        {alert.notes && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Additional Notes</Typography>
              <Typography>{alert.notes}</Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Resolve Dialog */}
      <Dialog open={resolveDialog.open} onClose={() => setResolveDialog({ ...resolveDialog, open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>Resolve SOS Alert</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Response Notes"
            value={resolveDialog.responseNotes}
            onChange={(e) => setResolveDialog({ ...resolveDialog, responseNotes: e.target.value })}
            sx={{ mt: 2 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={resolveDialog.policeNotified}
                onChange={(e) => setResolveDialog({ ...resolveDialog, policeNotified: e.target.checked })}
              />
            }
            label="Police notified"
            sx={{ display: 'block', mt: 2 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={resolveDialog.ambulanceNotified}
                onChange={(e) => setResolveDialog({ ...resolveDialog, ambulanceNotified: e.target.checked })}
              />
            }
            label="Ambulance notified"
            sx={{ display: 'block' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveDialog({ ...resolveDialog, open: false })}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleResolveSubmit} disabled={resolveMutation.isPending}>
            {resolveMutation.isPending ? 'Resolving...' : 'Resolve Alert'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SOSAlertDetails;
