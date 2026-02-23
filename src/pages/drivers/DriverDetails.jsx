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
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/common/PageHeader';
import { adminApi } from '../../services/api/admin.api';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  DirectionsCar as DirectionsCarIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Star as StarIcon,
  CreditCard as CreditCardIcon,
} from '@mui/icons-material';
import { ROUTES } from '../../utils/constants';

const DriverDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: null,
  });

  // Fetch driver details (id is driver document _id)
  const {
    data: driverData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['driver-details', id],
    queryFn: () => adminApi.getDriverDetails(id),
    enabled: !!id,
  });

  const { data: ridesData } = useQuery({
    queryKey: ['driver-rides', driverData?.profile?._id],
    queryFn: () => adminApi.getRides({ driverId: driverData?.profile?._id, limit: 10, page: 1 }),
    enabled: !!driverData?.profile?._id,
  });
  const recentRides = ridesData?.rides ?? [];

  // Mutations
  const approveMutation = useMutation({
    mutationFn: (driverId) => adminApi.approveDriver(driverId),
    onSuccess: () => {
      queryClient.invalidateQueries(['driver-details', id]);
      setConfirmDialog({ open: false });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (driverId) => adminApi.rejectDriver(driverId),
    onSuccess: () => {
      navigate('/drivers');
    },
  });

  const handleAction = (action) => {
    if (!driverData?.user || !driverData?.profile) return;

    const driver = driverData.profile;
    const actions = {
      approve: {
        title: 'Approve Driver',
        message: `Are you sure you want to approve this driver? They will be able to accept rides.`,
        action: () => approveMutation.mutate(driver._id),
      },
      reject: {
        title: 'Reject Driver',
        message: `Are you sure you want to reject this driver? Their application will be permanently removed.`,
        action: () => rejectMutation.mutate(driver._id),
      },
    };

    setConfirmDialog({
      open: true,
      ...actions[action],
    });
  };

  const getStatusColor = (driver) => {
    if (!driver.isApproved) return 'warning';
    if (driver.isActive) return 'success';
    return 'default';
  };

  const getStatusLabel = (driver) => {
    if (!driver.isApproved) return 'Pending Approval';
    if (driver.isActive) return 'Active';
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

  if (error || !driverData) {
    return (
      <>
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load driver details. Please try again.
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/drivers')}>
          Back to Drivers
        </Button>
      </>
    );
  }

  const { user, profile, statistics } = driverData;

  return (
    <>
      <PageHeader
        title={`Driver Details - ${profile?.name || user?.name || 'Driver'}`}
        subtitle="View and manage driver information"
        action={
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/drivers')}
          >
            Back to Drivers
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load driver details. Please try again.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Driver Profile Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 2,
                bgcolor: 'primary.main',
              }}
            >
              {user.name?.charAt(0)?.toUpperCase()}
            </Avatar>

            <Typography variant="h5" gutterBottom>
              {user.name}
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Chip
                label="Driver"
                color="primary"
                sx={{ mr: 1 }}
              />
              <Chip
                label={getStatusLabel(profile)}
                color={getStatusColor(profile)}
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
              {!profile.isApproved && (
                <Button
                  size="small"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => handleAction('approve')}
                  disabled={approveMutation.isPending}
                >
                  Approve
                </Button>
              )}
              <Button
                size="small"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => handleAction('reject')}
                disabled={rejectMutation.isPending}
              >
                Reject
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Driver Statistics */}
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
                    Total Earned
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    {formatCurrency(statistics?.totalEarned || 0)}
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

          {/* Driver Information */}
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
              {profile.approvedAt && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Approved At</Typography>
                  <Typography variant="body2">
                    {formatDateTime(profile.approvedAt)}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Member Since</Typography>
                <Typography variant="body2">
                  {formatDateTime(user.createdAt)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Vehicle Information */}
          {profile.vehicle && (
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Vehicle Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Make & Model</Typography>
                  <Typography variant="body2">
                    {profile.vehicle.make} {profile.vehicle.model}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Year</Typography>
                  <Typography variant="body2">{profile.vehicle.year}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Registration Number</Typography>
                  <Typography variant="body2">{profile.vehicle.registrationNumber}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Color</Typography>
                  <Typography variant="body2">{profile.vehicle.color}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Capacity</Typography>
                  <Typography variant="body2">{profile.vehicle.capacity} passengers</Typography>
                </Grid>
                {profile.vehicle.insurance && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Insurance Expiry</Typography>
                    <Typography variant="body2">
                      {profile.vehicle.insurance.expiryDate
                        ? new Date(profile.vehicle.insurance.expiryDate).toLocaleDateString()
                        : 'Not provided'
                      }
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          )}

          {/* Documents */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Documents
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">CNIC Document</Typography>
                <Typography variant="body2">
                  {user.cnicImage ? (
                    <Button size="small" startIcon={<CreditCardIcon />}>
                      View CNIC
                    </Button>
                  ) : (
                    'Not uploaded'
                  )}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">License Document</Typography>
                <Typography variant="body2">
                  {profile.licenseImage ? (
                    <Button size="small" startIcon={<CreditCardIcon />}>
                      View License
                    </Button>
                  ) : (
                    'Not uploaded'
                  )}
                </Typography>
              </Grid>
              {profile.vehicle?.images?.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Vehicle Images</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {profile.vehicle.images.map((image, index) => (
                      <Button key={index} size="small" startIcon={<DirectionsCarIcon />}>
                        Vehicle {index + 1}
                      </Button>
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
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
            color={confirmDialog.title.includes('Reject') ? 'error' : 'primary'}
            disabled={approveMutation.isPending || rejectMutation.isPending}
          >
            {approveMutation.isPending || rejectMutation.isPending ? (
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

export default DriverDetails;