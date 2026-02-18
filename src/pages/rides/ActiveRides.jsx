import { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { adminApi } from '../../services/api/admin.api';
import {
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  DirectionsCar as DirectionsCarIcon,
  Visibility as VisibilityIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { ROUTES } from '../../utils/constants';

const ActiveRides = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedRide, setSelectedRide] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: rides = [], isLoading, error } = useQuery({
    queryKey: ['active-rides'],
    queryFn: adminApi.getActiveRides,
    refetchInterval: 10000,
  });

  const cancelMutation = useMutation({
    mutationFn: ({ rideId, reason }) => adminApi.cancelRide(rideId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['active-rides']);
      queryClient.invalidateQueries(['rides']);
      setDialogOpen(false);
      setSelectedRide(null);
      setCancelReason('');
    },
  });

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(amount || 0);
  const formatDateTime = (d) =>
    d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  const getStatusColor = (status) => {
    const map = { pending: 'warning', accepted: 'info', 'in-progress': 'primary' };
    return map[status] || 'default';
  };

  const handleCancelClick = (ride) => {
    setSelectedRide(ride);
    setCancelReason('');
    setDialogOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Active Rides"
        subtitle="Rides currently pending, accepted, or in progress"
      />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>Failed to load active rides.</Alert>
      )}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ride ID</TableCell>
                <TableCell>Passenger</TableCell>
                <TableCell>Driver</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Pickup</TableCell>
                <TableCell>Fare</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : rides.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No active rides</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rides.map((ride) => (
                  <TableRow key={ride._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">{ride._id?.substring(0, 8)}...</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon sx={{ fontSize: 18 }} />
                        {ride.passengerId?.name || 'N/A'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DirectionsCarIcon sx={{ fontSize: 18 }} />
                        {ride.driverId?.name || 'Not assigned'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={ride.status} size="small" color={getStatusColor(ride.status)} sx={{ textTransform: 'capitalize' }} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, maxWidth: 180 }}>
                        <LocationOnIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                        <Typography noWrap variant="body2">{ride.pickup?.address || '—'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{ride.fare?.final ? formatCurrency(ride.fare.final) : '—'}</TableCell>
                    <TableCell>{formatDateTime(ride.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(ROUTES.RIDE_DETAILS(ride._id))}
                        sx={{ mr: 1 }}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => handleCancelClick(ride)}
                      >
                        Cancel
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {dialogOpen && selectedRide && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Cancel ride (optional reason)</Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              style={{ flex: 1, minWidth: 200, padding: 8 }}
            />
            <Button
              variant="contained"
              color="error"
              onClick={() => cancelMutation.mutate({ rideId: selectedRide._id, reason: cancelReason || 'Cancelled by admin' })}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? <CircularProgress size={20} /> : 'Confirm Cancel'}
            </Button>
            <Button onClick={() => { setDialogOpen(false); setSelectedRide(null); }}>Close</Button>
          </Box>
        </Paper>
      )}
    </>
  );
};

export default ActiveRides;
