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
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  DriveEta as DriveEtaIcon,
  Apps as AppsIcon,
} from '@mui/icons-material';

const ComplaintsList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [complainantTypeFilter, setComplainantTypeFilter] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolveDialog, setResolveDialog] = useState({
    open: false,
    resolution: '',
    adminNotes: '',
    action: '',
  });

  // Fetch complaints with filters
  const {
    data: complaintsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['complaints', page, rowsPerPage, search, statusFilter, complainantTypeFilter, targetTypeFilter],
    queryFn: () => adminApi.getComplaints({
      page: page + 1,
      limit: rowsPerPage,
      search: search || undefined,
      status: statusFilter || undefined,
      complainantType: complainantTypeFilter || undefined,
      targetType: targetTypeFilter || undefined,
    }),
  });

  // Resolve complaint mutation
  const resolveMutation = useMutation({
    mutationFn: ({ complaintId, resolutionData }) =>
      adminApi.resolveComplaint(complaintId, resolutionData),
    onSuccess: () => {
      queryClient.invalidateQueries(['complaints']);
      setResolveDialog({ open: false, resolution: '', adminNotes: '', action: '' });
    },
  });

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event, complaint) => {
    setAnchorEl(event.currentTarget);
    setSelectedComplaint(complaint);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedComplaint(null);
  };

  const handleViewDetails = () => {
    if (selectedComplaint) {
      navigate(`/complaints/${selectedComplaint._id}`);
    }
    handleMenuClose();
  };

  const handleResolveComplaint = () => {
    setResolveDialog({
      open: true,
      resolution: '',
      adminNotes: '',
      action: '',
    });
    handleMenuClose();
  };

  const handleResolveSubmit = () => {
    if (selectedComplaint && resolveDialog.resolution.trim()) {
      resolveMutation.mutate({
        complaintId: selectedComplaint._id,
        resolutionData: {
          resolution: resolveDialog.resolution,
          adminNotes: resolveDialog.adminNotes,
          action: resolveDialog.action,
        },
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'resolved':
        return 'success';
      default:
        return 'default';
    }
  };

  const getTargetTypeIcon = (targetType) => {
    switch (targetType) {
      case 'driver':
        return <DriveEtaIcon fontSize="small" />;
      case 'passenger':
        return <PersonIcon fontSize="small" />;
      case 'app':
        return <AppsIcon fontSize="small" />;
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
          Failed to load complaints. Please try again.
        </Alert>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Complaints Management"
        subtitle="Manage and resolve user complaints"
        icon={<ReportProblemIcon />}
      />

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search complaints..."
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
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Complainant</InputLabel>
            <Select
              value={complainantTypeFilter}
              label="Complainant"
              onChange={(e) => setComplainantTypeFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="passenger">Passenger</MenuItem>
              <MenuItem value="driver">Driver</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Target</InputLabel>
            <Select
              value={targetTypeFilter}
              label="Target"
              onChange={(e) => setTargetTypeFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="driver">Driver</MenuItem>
              <MenuItem value="passenger">Passenger</MenuItem>
              <MenuItem value="app">App</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Complaints Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Complainant</TableCell>
                <TableCell>Target</TableCell>
                <TableCell>Description</TableCell>
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
              ) : complaintsData?.data?.complaints?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    No complaints found
                  </TableCell>
                </TableRow>
              ) : (
                complaintsData?.data?.complaints?.map((complaint) => (
                  <TableRow key={complaint._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {complaint.complainantType === 'passenger' ? (
                            <PersonIcon fontSize="small" />
                          ) : (
                            <DriveEtaIcon fontSize="small" />
                          )}
                        </Avatar>
                        <Box>
                          <Box sx={{ fontWeight: 500 }}>
                            {complaint.complainantId?.name || 'Unknown'}
                          </Box>
                          <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                            {complaint.complainantType}
                          </Box>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTargetTypeIcon(complaint.targetType)}
                        <Box>
                          <Box sx={{ fontWeight: 500 }}>
                            {complaint.targetId?.name || 'Unknown'}
                          </Box>
                          <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                            {complaint.targetType}
                          </Box>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ maxWidth: 300 }}>
                        {complaint.description.length > 100
                          ? `${complaint.description.substring(0, 100)}...`
                          : complaint.description
                        }
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={complaint.status}
                        color={getStatusColor(complaint.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {formatDate(complaint.createdAt)}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, complaint)}
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
          count={complaintsData?.data?.pagination?.total || 0}
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
          <VisibilityIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        {selectedComplaint?.status === 'pending' && (
          <MenuItem onClick={handleResolveComplaint}>
            <CheckCircleIcon sx={{ mr: 1 }} />
            Resolve Complaint
          </MenuItem>
        )}
      </Menu>

      {/* Resolve Complaint Dialog */}
      <Dialog
        open={resolveDialog.open}
        onClose={() => setResolveDialog({ open: false, resolution: '', adminNotes: '', action: '' })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Resolve Complaint</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Resolution"
            fullWidth
            multiline
            rows={3}
            value={resolveDialog.resolution}
            onChange={(e) => setResolveDialog(prev => ({ ...prev, resolution: e.target.value }))}
            placeholder="Describe how this complaint was resolved..."
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Admin Notes (Optional)"
            fullWidth
            multiline
            rows={2}
            value={resolveDialog.adminNotes}
            onChange={(e) => setResolveDialog(prev => ({ ...prev, adminNotes: e.target.value }))}
            placeholder="Internal notes for this resolution..."
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Action Taken</InputLabel>
            <Select
              value={resolveDialog.action}
              label="Action Taken"
              onChange={(e) => setResolveDialog(prev => ({ ...prev, action: e.target.value }))}
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="warning">Issued Warning</MenuItem>
              <MenuItem value="refund">Processed Refund</MenuItem>
              <MenuItem value="suspend">Suspended Account</MenuItem>
              <MenuItem value="block">Blocked Account</MenuItem>
              <MenuItem value="other">Other Action</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setResolveDialog({ open: false, resolution: '', adminNotes: '', action: '' })}
          >
            Cancel
          </Button>
          <Button
            onClick={handleResolveSubmit}
            variant="contained"
            disabled={!resolveDialog.resolution.trim() || resolveMutation.isPending}
          >
            {resolveMutation.isPending ? <CircularProgress size={20} /> : 'Resolve'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ComplaintsList;