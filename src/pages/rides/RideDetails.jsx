import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/common/PageHeader';
import { adminApi } from '../../services/api/admin.api';
import {
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  DirectionsCar as DirectionsCarIcon,
  Cancel as CancelIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { ROUTES } from '../../utils/constants';

const RideDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cancelDialog, setCancelDialog] = useState({ open: false, reason: '' });

  const { data: ride, isLoading, error } = useQuery({
    queryKey: ['ride-details', id],
    queryFn: () => adminApi.getRideDetails(id),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: ({ rideId, reason }) => adminApi.cancelRide(rideId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['ride-details', id]);
      queryClient.invalidateQueries(['rides']);
      queryClient.invalidateQueries(['active-rides']);
      setCancelDialog({ open: false, reason: '' });
    },
  });

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(amount || 0);
  const formatDateTime = (d) =>
    d ? new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

  const getStatusColor = (status) => {
    const map = { pending: 'warning', accepted: 'info', 'in-progress': 'primary', completed: 'success', cancelled: 'error' };
    return map[status] || 'default';
  };

  if (isLoading || !ride)
    return (
      <>
        <PageHeader title="Ride Details" />
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </>
    );

  if (error)
    return (
      <>
        <PageHeader title="Ride Details" />
        <Alert severity="error">Failed to load ride details.</Alert>
      </>
    );

  const canCancel = ride.status && !['completed', 'cancelled'].includes(ride.status);

  return (
    <>
      <PageHeader
        title="Ride Details"
        subtitle={`Ride ${ride._id?.substring(0, 8)}...`}
        action={
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(ROUTES.RIDES)}>
            Back to Rides
          </Button>
        }
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Status</Typography>
              <Chip label={ride.status} color={getStatusColor(ride.status)} sx={{ textTransform: 'capitalize' }} />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary">Pickup</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <LocationOnIcon color="primary" />
              <Typography>{ride.pickup?.address || '—'}</Typography>
            </Box>
            <Typography variant="subtitle2" color="text.secondary">Destination</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <LocationOnIcon color="error" />
              <Typography>{ride.destination?.address || '—'}</Typography>
            </Box>
            {ride.fare && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoneyIcon />
                  <Typography variant="h6">{formatCurrency(ride.fare.final)}</Typography>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Passenger</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon />
              <Typography>{ride.passengerId?.name ?? ride.passengerId?.userId?.name ?? '—'}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {ride.passengerId?.userId?.phone ?? ride.passengerId?.phone ?? ''}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>Driver</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DirectionsCarIcon />
              <Typography>{ride.driverId?.name ?? ride.driverId?.userId?.name ?? 'Not assigned'}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {ride.driverId?.userId?.phone ?? ride.driverId?.phone ?? ''}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">Created: {formatDateTime(ride.createdAt)}</Typography>
            </Box>
            {canCancel && (
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => setCancelDialog({ open: true, reason: '' })}
                sx={{ mt: 2 }}
              >
                Cancel Ride
              </Button>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={cancelDialog.open} onClose={() => setCancelDialog({ open: false, reason: '' })}>
        <DialogTitle>Cancel Ride</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Reason (optional)"
            multiline
            rows={2}
            value={cancelDialog.reason}
            onChange={(e) => setCancelDialog((p) => ({ ...p, reason: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog({ open: false, reason: '' })}>Close</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => cancelMutation.mutate({ rideId: id, reason: cancelDialog.reason || 'Cancelled by admin' })}
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending ? <CircularProgress size={24} /> : 'Cancel Ride'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RideDetails;
