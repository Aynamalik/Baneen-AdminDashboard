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
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/common/PageHeader';
import { adminApi } from '../../services/api/admin.api';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Payment as PaymentIcon,
  AttachMoney as AttachMoneyIcon,
  TrendingUp as TrendingUpIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';

const PaymentsList = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [refundDialog, setRefundDialog] = useState({ open: false, payment: null, reason: '', amount: '' });

  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const endDate = new Date().toISOString().split('T')[0];

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['payment-stats', startDate, endDate],
    queryFn: () => adminApi.getPaymentStats({ startDate, endDate }),
  });

  const {
    data: paymentsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['payments', page, rowsPerPage, statusFilter],
    queryFn: () =>
      adminApi.getAllPayments({
        page: page + 1,
        limit: rowsPerPage,
        status: statusFilter || undefined,
        startDate,
        endDate,
      }),
  });

  const refundMutation = useMutation({
    mutationFn: (data) => adminApi.processRefund(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['payments']);
      queryClient.invalidateQueries(['payment-stats']);
      setRefundDialog({ open: false, payment: null, reason: '', amount: '' });
    },
  });

  const handleRefund = () => {
    if (!refundDialog.payment) return;
    refundMutation.mutate({
      paymentId: refundDialog.payment._id,
      amount: refundDialog.payment.amount,
      reason: refundDialog.reason || 'Admin initiated refund',
    });
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount || 0);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'refunded':
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const payments = paymentsData?.payments ?? [];
  const pagination = paymentsData?.pagination;

  return (
    <>
      <PageHeader
        title="Payment Management"
        subtitle="View and manage all payment transactions"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load payments. Please try again.
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoneyIcon color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Total Revenue (30d)
                </Typography>
              </Box>
              <Typography variant="h4">
                {statsLoading ? '...' : formatCurrency(stats?.totalAmount || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptIcon color="success" />
                <Typography variant="body2" color="text.secondary">
                  Completed
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {statsLoading ? '...' : stats?.completedPayments ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaymentIcon color="warning" />
                <Typography variant="body2" color="text.secondary">
                  Pending
                </Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {statsLoading ? '...' : (stats?.totalPayments ?? 0) - (stats?.completedPayments ?? 0) - (stats?.failedPayments ?? 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon color="info" />
                <Typography variant="body2" color="text.secondary">
                  Refunded
                </Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {statsLoading ? '...' : formatCurrency(stats?.refundedAmount || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="refunded">Refunded</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
          </TextField>
          <Button
            startIcon={<FilterListIcon />}
            onClick={() => setStatusFilter('')}
          >
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {/* Payments Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Transaction</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : payments.length > 0 ? (
                payments.map((payment) => (
                  <TableRow key={payment._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {payment.transactionId || payment._id?.toString().slice(-8)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {payment.userId?.email || payment.userId?.phone || 'N/A'}
                    </TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      <Chip label={payment.method || payment.gateway || 'N/A'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payment.status}
                        size="small"
                        color={getStatusColor(payment.status)}
                      />
                    </TableCell>
                    <TableCell>
                      {payment.createdAt
                        ? new Date(payment.createdAt).toLocaleString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      {payment.status === 'completed' && (
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={() =>
                            setRefundDialog({
                              open: true,
                              payment,
                              reason: '',
                              amount: payment.amount,
                            })
                          }
                        >
                          Refund
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No payments found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {pagination && (
          <TablePagination
            component="div"
            count={pagination.total}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        )}
      </Paper>

      {/* Refund Dialog */}
      <Dialog open={refundDialog.open} onClose={() => setRefundDialog({ open: false, payment: null, reason: '', amount: '' })}>
        <DialogTitle>Process Refund</DialogTitle>
        <DialogContent>
          {refundDialog.payment && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Amount: {formatCurrency(refundDialog.payment.amount)}
              </Typography>
              <TextField
                fullWidth
                label="Reason"
                multiline
                rows={3}
                value={refundDialog.reason}
                onChange={(e) => setRefundDialog((prev) => ({ ...prev, reason: e.target.value }))}
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefundDialog({ open: false, payment: null, reason: '', amount: '' })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRefund}
            disabled={refundMutation.isPending}
          >
            {refundMutation.isPending ? <CircularProgress size={20} /> : 'Process Refund'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PaymentsList;
