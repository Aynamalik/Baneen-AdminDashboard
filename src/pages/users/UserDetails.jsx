import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Avatar,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/common/PageHeader';
import { adminApi } from '../../services/api/admin.api';
import { ROUTES } from '../../utils/constants';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Star as StarIcon,
} from '@mui/icons-material';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: null,
  });
  const closeConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      title: '',
      message: '',
      action: null,
    });
  };

  // Fetch user details
  const {
    data: userData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['user-details', id],
    queryFn: () => adminApi.getUserDetails(id),
    enabled: !!id,
  });

  const profileId = userData?.profile?._id;
  const rideFilter = userData?.user?.role === 'passenger' ? { passengerId: profileId } : userData?.user?.role === 'driver' ? { driverId: profileId } : null;
  const { data: ridesData } = useQuery({
    queryKey: ['user-rides', profileId, userData?.user?.role],
    queryFn: () => adminApi.getRides({ ...rideFilter, limit: 10, page: 1 }),
    enabled: !!profileId && !!rideFilter,
  });
  const recentRides = ridesData?.rides ?? [];

  // Mutations
  const verifyMutation = useMutation({
    mutationFn: (userId) => adminApi.verifyUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-details', id] });
      closeConfirmDialog();
    },
  });

  const blockMutation = useMutation({
    mutationFn: (userId) => adminApi.blockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-details', id] });
      closeConfirmDialog();
    },
  });

  const unblockMutation = useMutation({
    mutationFn: (userId) => adminApi.unblockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-details', id] });
      closeConfirmDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId) => adminApi.deleteUser(userId),
    onSuccess: () => {
      navigate('/users');
    },
  });

  const handleAction = (action) => {
    if (!userData?.user) return;

    const user = userData.user;
    const actions = {
      verify: {
        title: 'Verify User',
        message: `Are you sure you want to verify ${user.name}?`,
        action: () => verifyMutation.mutate(user._id),
      },
      block: {
        title: 'Block User',
        message: `Are you sure you want to block ${user.name}? They will not be able to use the app.`,
        action: () => blockMutation.mutate(user._id),
      },
      unblock: {
        title: 'Unblock User',
        message: `Are you sure you want to unblock ${user.name}?`,
        action: () => unblockMutation.mutate(user._id),
      },
      delete: {
        title: 'Delete User',
        message: `Are you sure you want to permanently delete ${user.name}? This action cannot be undone.`,
        action: () => deleteMutation.mutate(user._id),
      },
    };

    setConfirmDialog({
      open: true,
      ...actions[action],
    });
  };

  const getStatusColor = (user) => {
    if (user.isBlocked) return 'error';
    if (!user.isVerified) return 'warning';
    if (user.isActive) return 'success';
    return 'default';
  };

  const getStatusLabel = (user) => {
    if (user.isBlocked) return 'Blocked';
    if (!user.isVerified) return 'Unverified';
    if (user.isActive) return 'Active';
    return 'Inactive';
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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (error || !userData) {
    return (
      <>
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load user details. Please try again.
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/users')}>
          Back to Users
        </Button>
      </>
    );
  }

  const { user, profile, statistics } = userData;

  return (
    <>
      <PageHeader
        title={`User Details - ${user.name}`}
        subtitle="View and manage user information"
        action={
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/users')}
          >
            Back to Users
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load user details. Please try again.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* User Profile Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 2,
                bgcolor: user.role === 'admin' ? 'secondary.main' : 'primary.main',
              }}
            >
              {user.name?.charAt(0)?.toUpperCase()}
            </Avatar>

            <Typography variant="h5" gutterBottom>
              {user.name}
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Chip
                label={user.role}
                color={user.role === 'admin' ? 'secondary' : 'primary'}
                sx={{ mr: 1 }}
              />
              <Chip
                label={getStatusLabel(user)}
                color={getStatusColor(user)}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon fontSize="small" />
                <Typography variant="body2">{user.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon fontSize="small" />
                <Typography variant="body2">{user.phone}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon fontSize="small" />
                <Typography variant="body2">CNIC: {user.cnic}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
              {!user.isVerified && (
                <Button
                  size="small"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => handleAction('verify')}
                  disabled={verifyMutation.isPending}
                >
                  Verify
                </Button>
              )}
              {!user.isBlocked ? (
                <Button
                  size="small"
                  color="error"
                  startIcon={<BlockIcon />}
                  onClick={() => handleAction('block')}
                  disabled={blockMutation.isPending}
                >
                  Block
                </Button>
              ) : (
                <Button
                  size="small"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => handleAction('unblock')}
                  disabled={unblockMutation.isPending}
                >
                  Unblock
                </Button>
              )}
              <Button
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => handleAction('delete')}
                disabled={deleteMutation.isPending}
              >
                Delete
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* User Statistics */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Rides
                  </Typography>
                  <Typography variant="h4">
                    {statistics?.totalRides || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Completed Rides
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {statistics?.completedRides || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {user.role === 'passenger' ? 'Total Spent' : 'Total Earned'}
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    {formatCurrency(statistics?.totalSpent || statistics?.totalEarned || 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Rating
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h4" sx={{ mr: 1 }}>
                      {profile?.rating ? profile.rating.toFixed(1) : 'N/A'}
                    </Typography>
                    {profile?.rating && <StarIcon sx={{ color: 'warning.main' }} />}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Role-specific Information */}
          {user.role === 'passenger' && profile && (
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Passenger Information
              </Typography>
              {profile.emergencyContacts?.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Emergency Contacts
                  </Typography>
                  {profile.emergencyContacts.map((contact, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        {contact.name} ({contact.relationship})
                      </Typography>
                      <Typography variant="body2">{contact.phone}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
              {profile.subscription && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Subscription Status
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Chip
                      label={profile.subscription.isActive ? 'Active' : 'Inactive'}
                      color={profile.subscription.isActive ? 'success' : 'default'}
                      size="small"
                    />
                    <Typography variant="body2">
                      {profile.subscription.ridesRemaining} rides remaining
                    </Typography>
                  </Box>
                </Box>
              )}
            </Paper>
          )}

          {user.role === 'driver' && profile && (
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Driver Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">License Number</Typography>
                  <Typography variant="body2">{profile.licenseNumber || 'Not provided'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Approval Status</Typography>
                  <Chip
                    label={profile.isApproved ? 'Approved' : 'Pending'}
                    color={profile.isApproved ? 'success' : 'warning'}
                    size="small"
                  />
                </Grid>
                {profile.vehicle && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="subtitle2" gutterBottom>
                        Vehicle Information
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        {profile.vehicle.make} {profile.vehicle.model} ({profile.vehicle.year})
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        Reg: {profile.vehicle.registrationNumber}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        Color: {profile.vehicle.color}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        Capacity: {profile.vehicle.capacity} passengers
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>
          )}
        </Grid>

        {/* Recent Rides */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Rides
            </Typography>
            {recentRides.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No rides yet.
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Pickup</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Fare</TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => navigate(ROUTES.RIDES)}>View all</Button>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentRides.map((ride) => (
                      <TableRow key={ride._id}>
                        <TableCell>{formatDateTime(ride.createdAt)}</TableCell>
                        <TableCell sx={{ maxWidth: 180 }} noWrap>{ride.pickup?.address || '—'}</TableCell>
                        <TableCell>
                          <Chip label={ride.status} size="small" sx={{ textTransform: 'capitalize' }} />
                        </TableCell>
                        <TableCell>{formatCurrency(ride.fare?.final)}</TableCell>
                        <TableCell align="right">
                          <Button size="small" onClick={() => navigate(ROUTES.RIDE_DETAILS(ride._id))}>View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={closeConfirmDialog}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog}>
            Cancel
          </Button>
          <Button
            onClick={confirmDialog.action}
            variant="contained"
            color={confirmDialog.title.includes('Delete') ? 'error' : 'primary'}
            disabled={
              verifyMutation.isPending ||
              blockMutation.isPending ||
              unblockMutation.isPending ||
              deleteMutation.isPending
            }
          >
            {verifyMutation.isPending ||
            blockMutation.isPending ||
            unblockMutation.isPending ||
            deleteMutation.isPending ? (
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

export default UserDetails;