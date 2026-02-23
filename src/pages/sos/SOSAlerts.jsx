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
  FormControl,
  InputLabel,
  Select,
  Avatar,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/common/PageHeader';
import { adminApi } from '../../services/api/admin.api';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  ReportProblem as ReportProblemIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

const SOSAlerts = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [resolveDialog, setResolveDialog] = useState({
    open: false,
    resolution: '',
    responseNotes: '',
    policeNotified: false,
    ambulanceNotified: false,
  });

  // Fetch SOS alerts with filters
  const {
    data: alertsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['sos-alerts', page, rowsPerPage, search, statusFilter, severityFilter],
    queryFn: () => adminApi.getSOSAlerts({
      page: page + 1,
      limit: rowsPerPage,
      search: search || undefined,
      status: statusFilter || undefined,
      severity: severityFilter || undefined,
    }),
  });

  // Resolve SOS alert mutation
  const resolveMutation = useMutation({
    mutationFn: ({ alertId, resolutionData }) =>
      adminApi.resolveSOSAlert(alertId, resolutionData),
    onSuccess: () => {
      queryClient.invalidateQueries(['sos-alerts']);
      setResolveDialog({ open: false, resolution: '', responseNotes: '', policeNotified: false, ambulanceNotified: false });
    },
  });

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event, alert) => {
    setAnchorEl(event.currentTarget);
    setSelectedAlert(alert);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAlert(null);
  };

  const handleViewDetails = () => {
    if (selectedAlert) {
      navigate(`/sos/${selectedAlert._id}`);
    }
    handleMenuClose();
  };

  const handleResolveAlert = () => {
    setResolveDialog({
      open: true,
      resolution: '',
      responseNotes: '',
      policeNotified: false,
      ambulanceNotified: false,
    });
    handleMenuClose();
  };

  const handleResolveSubmit = () => {
    if (selectedAlert) {
      resolveMutation.mutate({
        alertId: selectedAlert._id,
        resolutionData: {
          resolution: resolveDialog.resolution || 'Alert resolved by admin',
          responseNotes: resolveDialog.responseNotes,
          policeNotified: resolveDialog.policeNotified,
          ambulanceNotified: resolveDialog.ambulanceNotified,
        },
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'error';
      case 'resolved':
        return 'success';
      case 'false-alarm':
        return 'warning';
      default:
        return 'default';
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
        return <ErrorIcon fontSize="small" />;
      case 'medium':
        return <WarningIcon fontSize="small" />;
      default:
        return <ReportProblemIcon fontSize="small" />;
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

  if (error) {
    return (
      <>
        <Alert severity="error" sx={{ mt: 2 }}>
          Failed to load SOS alerts. Please try again.
        </Alert>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="SOS Emergency Alerts"
        subtitle="Monitor and respond to emergency situations"
        icon={<ReportProblemIcon />}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => navigate('/sos/active')}
          >
            View Active Alerts
          </Button>
        }
      />

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search alerts..."
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

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="false-alarm">False Alarm</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Severity</InputLabel>
            <Select
              value={severityFilter}
              label="Severity"
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* SOS Alerts Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : alertsData?.data?.alerts?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    No SOS alerts found
                  </TableCell>
                </TableRow>
              ) : (
                alertsData?.data?.alerts?.map((alert) => (
                  <TableRow key={alert._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          <PersonIcon fontSize="small" />
                        </Avatar>
                        <Box>
                          <Box sx={{ fontWeight: 500 }}>
                            {alert.userId?.name || 'Unknown'}
                          </Box>
                          <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                            {alert.userId?.phone || 'No phone'}
                          </Box>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOnIcon fontSize="small" color="action" />
                        <Box>
                          <Box sx={{ fontSize: '0.875rem' }}>
                            {alert.location?.address || 'Location not available'}
                          </Box>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getSeverityIcon(alert.severity)}
                        label={alert.severity}
                        color={getSeverityColor(alert.severity)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={alert.status}
                        color={getStatusColor(alert.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {formatDate(alert.createdAt)}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, alert)}
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={alertsData?.data?.pagination?.total || 0}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>
          <LocationOnIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        {selectedAlert?.status === 'active' && (
          <MenuItem onClick={handleResolveAlert}>
            <CheckCircleIcon sx={{ mr: 1 }} />
            Resolve Alert
          </MenuItem>
        )}
      </Menu>

      {/* Resolve Alert Dialog */}
      <Dialog
        open={resolveDialog.open}
        onClose={() => setResolveDialog({ open: false, resolution: '', responseNotes: '', policeNotified: false, ambulanceNotified: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Resolve SOS Alert</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This is an emergency situation. Please handle with appropriate urgency.
          </Alert>

          <TextField
            autoFocus
            margin="dense"
            label="Resolution Notes"
            fullWidth
            multiline
            rows={3}
            value={resolveDialog.resolution}
            onChange={(e) => setResolveDialog(prev => ({ ...prev, resolution: e.target.value }))}
            placeholder="Describe how this emergency situation was handled..."
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
            placeholder="Details about police/ambulance response..."
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
            disabled={resolveMutation.isPending}
          >
            {resolveMutation.isPending ? <CircularProgress size={20} /> : 'Resolve Emergency'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SOSAlerts;