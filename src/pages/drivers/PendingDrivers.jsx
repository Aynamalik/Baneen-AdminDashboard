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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { adminApi } from '../../services/api/admin.api';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { ROUTES } from '../../utils/constants';

const PendingDrivers = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, driver: null });

  const { data: drivers = [], isLoading, error } = useQuery({
    queryKey: ['pending-drivers'],
    queryFn: adminApi.getPendingDrivers,
    refetchInterval: 30000,
  });

  const approveMutation = useMutation({
    mutationFn: (driverId) => adminApi.approveDriver(driverId),
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-drivers']);
      queryClient.invalidateQueries(['drivers']);
      setConfirmDialog({ open: false, action: null, driver: null });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (driverId) => adminApi.rejectDriver(driverId),
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-drivers']);
      queryClient.invalidateQueries(['drivers']);
      setConfirmDialog({ open: false, action: null, driver: null });
    },
  });

  const handleApprove = (driver) => {
    setConfirmDialog({
      open: true,
      action: 'approve',
      driver,
    });
  };

  const handleReject = (driver) => {
    setConfirmDialog({
      open: true,
      action: 'reject',
      driver,
    });
  };

  const handleConfirm = () => {
    if (!confirmDialog.driver) return;
    if (confirmDialog.action === 'approve') approveMutation.mutate(confirmDialog.driver._id);
    else rejectMutation.mutate(confirmDialog.driver._id);
  };

  return (
    <>
      <PageHeader
        title="Pending Driver Approvals"
        subtitle={`${drivers.length} driver(s) awaiting approval`}
      />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>Failed to load pending drivers.</Alert>
      )}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Driver</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : drivers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No pending drivers</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                drivers.map((d) => (
                  <TableRow key={d._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 36, height: 36 }}>
                          <PersonIcon />
                        </Avatar>
                        <Typography fontWeight="medium">{d.name ?? d.userId?.name ?? '—'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{d.userId?.email ?? '—'}</TableCell>
                    <TableCell>{d.userId?.phone ?? '—'}</TableCell>
                    <TableCell>
                      {d.vehicle?.vehicleType && d.vehicle?.vehicleName
                        ? `${d.vehicle.vehicleType} - ${d.vehicle.vehicleName}`
                        : '—'}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(ROUTES.DRIVERS + '/' + d._id)}
                        sx={{ mr: 1 }}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleApprove(d)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => handleReject(d)}
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, action: null, driver: null })}>
        <DialogTitle>
          {confirmDialog.action === 'approve' ? 'Approve Driver' : 'Reject Driver'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialog.action === 'approve'
              ? `Approve ${confirmDialog.driver?.name ?? confirmDialog.driver?.userId?.name ?? 'this driver'}? They will be able to accept rides.`
              : `Reject ${confirmDialog.driver?.name ?? confirmDialog.driver?.userId?.name ?? 'this driver'}? This will remove their application.`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, action: null, driver: null })}>Cancel</Button>
          <Button
            variant="contained"
            color={confirmDialog.action === 'approve' ? 'success' : 'error'}
            onClick={handleConfirm}
            disabled={approveMutation.isPending || rejectMutation.isPending}
          >
            {(approveMutation.isPending || rejectMutation.isPending) ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PendingDrivers;
