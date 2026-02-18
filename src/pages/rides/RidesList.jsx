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
  TablePagination,
  TextField,
  InputAdornment,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/common/PageHeader';
import { adminApi } from '../../services/api/admin.api';
import { useNavigate } from 'react-router-dom';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Cancel as CancelIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  DirectionsCar as DirectionsCarIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { ROUTES } from '../../utils/constants';

const RidesList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRide, setSelectedRide] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: null,
  });

  // Fetch rides with filters
  const {
    data: ridesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['rides', page, rowsPerPage, search, statusFilter],
    queryFn: () => adminApi.getRides({
      page: page + 1,
      limit: rowsPerPage,
      search: search || undefined,
      status: statusFilter || undefined,
    }),
  });

  // Fetch active rides
  const {
    data: activeRidesData,
    isLoading: activeRidesLoading,
  } = useQuery({
    queryKey: ['active-rides-admin'],
    queryFn: adminApi.getActiveRides,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Mutation for cancelling rides
  const cancelMutation = useMutation({
    mutationFn: ({ rideId, reason }) => adminApi.cancelRide(rideId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['rides']);
      queryClient.invalidateQueries(['active-rides-admin']);
      setConfirmDialog({ open: false });
    },
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event, ride) => {
    setAnchorEl(event.currentTarget);
    setSelectedRide(ride);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRide(null);
  };

  const handleCancelRide = () => {
    if (!selectedRide) return;

    setConfirmDialog({
      open: true,
      title: 'Cancel Ride',
      message: `Are you sure you want to cancel this ride? This action cannot be undone.`,
      action: () => cancelMutation.mutate({
        rideId: selectedRide._id,
        reason: 'Cancelled by admin'
      }),
    });
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      accepted: 'info',
      'in-progress': 'primary',
      completed: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <PageHeader
        title="Ride Management"
        subtitle="Monitor and manage all rides in the system"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load rides. Please try again.
        </Alert>
      )}

      {/* Active Rides Summary */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DirectionsCarIcon color="primary" />
          <Box>
            <Typography variant="h6">
              Active Rides: {activeRidesLoading ? '...' : (Array.isArray(activeRidesData) ? activeRidesData.length : 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Currently ongoing rides in the system
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search rides..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />

          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="accepted">Accepted</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>

          <Button
            startIcon={<FilterListIcon />}
            onClick={() => {
              setSearch('');
              setStatusFilter('');
            }}
          >
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {/* Rides Table */}
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
                <TableCell>Destination</TableCell>
                <TableCell>Fare</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : ridesData?.rides?.length > 0 ? (
                ridesData.rides.map((ride) => (
                  <TableRow key={ride._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {ride._id.substring(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24 }}>
                          <PersonIcon sx={{ fontSize: 14 }} />
                        </Avatar>
                        <Typography variant="body2">
                          {ride.passengerId?.name || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24 }}>
                          <DirectionsCarIcon sx={{ fontSize: 14 }} />
                        </Avatar>
                        <Typography variant="body2">
                          {ride.driverId?.name || 'Not assigned'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ride.status.replace('-', ' ')}
                        size="small"
                        color={getStatusColor(ride.status)}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOnIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                        <Typography variant="body2" noWrap sx={{ maxWidth: 120 }}>
                          {ride.pickup?.address || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOnIcon sx={{ fontSize: 16, color: 'error.main' }} />
                        <Typography variant="body2" noWrap sx={{ maxWidth: 120 }}>
                          {ride.destination?.address || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {ride.fare?.final ? formatCurrency(ride.fare.final) : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {formatDateTime(ride.createdAt)}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={(e) => handleMenuOpen(e, ride)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No rides found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {ridesData?.pagination && (
          <TablePagination
            component="div"
            count={ridesData.pagination.total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        )}
      </Paper>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { if (selectedRide) navigate(ROUTES.RIDE_DETAILS(selectedRide._id)); handleMenuClose(); }}>
          <VisibilityIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleCancelRide} sx={{ color: 'error.main' }}>
          <CancelIcon sx={{ mr: 1 }} />
          Cancel Ride
        </MenuItem>
      </Menu>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false })}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false })}>
            Cancel
          </Button>
          <Button
            onClick={confirmDialog.action}
            variant="contained"
            color="error"
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending ? (
              <CircularProgress size={20} />
            ) : (
              'Confirm'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RidesList;