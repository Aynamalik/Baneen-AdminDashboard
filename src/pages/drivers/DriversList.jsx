import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Typography,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/common/PageHeader';
import { adminApi } from '../../services/api/admin.api';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  DirectionsCar as DirectionsCarIcon,
  Person as PersonIcon,
  Pending as PendingIcon,
  Verified as VerifiedIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

const DriversList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: null,
  });

  // Fetch drivers with filters
  const {
    data: driversData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['drivers', page, rowsPerPage, search, statusFilter],
    queryFn: () => adminApi.getDrivers({
      page: page + 1,
      limit: rowsPerPage,
      search: search || undefined,
      status: statusFilter || undefined,
    }),
  });

  // Fetch pending drivers
  const {
    data: pendingDriversData,
    isLoading: pendingLoading,
  } = useQuery({
    queryKey: ['pending-drivers'],
    queryFn: adminApi.getPendingDrivers,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mutations for driver actions
  const approveMutation = useMutation({
    mutationFn: (driverId) => adminApi.approveDriver(driverId),
    onSuccess: () => {
      queryClient.invalidateQueries(['drivers']);
      queryClient.invalidateQueries(['pending-drivers']);
      setConfirmDialog({ open: false });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (driverId) => adminApi.rejectDriver(driverId),
    onSuccess: () => {
      queryClient.invalidateQueries(['drivers']);
      queryClient.invalidateQueries(['pending-drivers']);
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

  const handleMenuOpen = (event, driver) => {
    setAnchorEl(event.currentTarget);
    setSelectedDriver(driver);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDriver(null);
  };

  const handleAction = (action) => {
    if (!selectedDriver) return;

    const actions = {
      approve: {
        title: 'Approve Driver',
        message: `Are you sure you want to approve ${selectedDriver.name}? They will be able to accept rides.`,
        action: () => approveMutation.mutate(selectedDriver._id),
      },
      reject: {
        title: 'Reject Driver',
        message: `Are you sure you want to reject ${selectedDriver.name}? Their application will be permanently removed.`,
        action: () => rejectMutation.mutate(selectedDriver._id),
      },
    };

    setConfirmDialog({
      open: true,
      ...actions[action],
    });
    handleMenuClose();
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

  const pendingCount = Array.isArray(pendingDriversData) ? pendingDriversData.length : 0;

  return (
    <>
      <PageHeader
        title="Driver Management"
        subtitle="Manage driver registrations and approvals"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load drivers. Please try again.
        </Alert>
      )}

      {/* Pending Approvals Summary */}
      {pendingCount > 0 && (
        <Paper sx={{ p: 3, mb: 3, backgroundColor: 'warning.light' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PendingIcon color="warning" fontSize="large" />
            <Box>
              <Typography variant="h6" color="warning.dark">
                {pendingCount} Driver{pendingCount !== 1 ? 's' : ''} Awaiting Approval
              </Typography>
              <Typography variant="body2" color="warning.dark">
                New driver applications require your review
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="warning"
              sx={{ ml: 'auto' }}
              onClick={() => setStatusFilter('pending')}
            >
              Review Now
            </Button>
          </Box>
        </Paper>
      )}

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DirectionsCarIcon color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Total Drivers
                </Typography>
              </Box>
              <Typography variant="h4">
                {driversData?.pagination?.total || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PendingIcon color="warning" />
                <Typography variant="body2" color="text.secondary">
                  Pending Approval
                </Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {pendingCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VerifiedIcon color="success" />
                <Typography variant="body2" color="text.secondary">
                  Approved
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {driversData?.drivers?.filter(d => d.isApproved).length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="info" />
                <Typography variant="body2" color="text.secondary">
                  Active Now
                </Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {driversData?.drivers?.filter(d => d.isActive).length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search drivers..."
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
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
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

      {/* Drivers Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Driver</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>CNIC</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Registered</TableCell>
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
              ) : driversData?.drivers?.length > 0 ? (
                driversData.drivers.map((driver) => (
                  <TableRow
                    key={driver._id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/drivers/${driver._id}`)}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {driver.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" fontWeight="medium">
                          {driver.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{driver.userId?.email || 'N/A'}</TableCell>
                    <TableCell>{driver.userId?.phone || 'N/A'}</TableCell>
                    <TableCell>{driver.userId?.cnic || 'N/A'}</TableCell>
                    <TableCell>
                      {driver.vehicle ? (
                        <Box>
                          <Typography variant="body2">
                            {driver.vehicle.vehicleName} {driver.vehicle.model}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {driver.vehicle.registrationNumber}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No vehicle
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(driver)}
                        size="small"
                        color={getStatusColor(driver)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {driver.rating ? `${driver.rating.toFixed(1)} ⭐` : 'No rating'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(driver.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <IconButton onClick={(e) => handleMenuOpen(e, driver)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No drivers found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {driversData?.pagination && (
          <TablePagination
            component="div"
            count={driversData.pagination.total}
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
        <MenuItem onClick={() => {
          handleMenuClose();
          navigate(`/drivers/${selectedDriver?._id}`);
        }}>
          <VisibilityIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        {!selectedDriver?.isApproved ? (
          <>
            <MenuItem onClick={() => handleAction('approve')}>
              <CheckCircleIcon sx={{ mr: 1 }} />
              Approve Driver
            </MenuItem>
            <MenuItem onClick={() => handleAction('reject')} sx={{ color: 'error.main' }}>
              <CancelIcon sx={{ mr: 1 }} />
              Reject Driver
            </MenuItem>
          </>
        ) : null}
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
            color={confirmDialog.title.includes('Reject') ? 'error' : 'primary'}
            disabled={
              approveMutation.isPending || rejectMutation.isPending
            }
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

export default DriversList;