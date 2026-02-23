import { useState } from 'react';
import {
  Paper,
  Table,
  TablePagination,
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
  IconButton,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/common/PageHeader';
import { adminApi } from '../../services/api/admin.api';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import PlanFormDialog from './PlanFormDialog';

const SubscriptionsList = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, plan: null });

  const { data, isLoading, error } = useQuery({
    queryKey: ['subscription-plans', page, rowsPerPage],
    queryFn: () => adminApi.getSubscriptionPlans({ page: page + 1, limit: rowsPerPage }),
  });

  const deleteMutation = useMutation({
    mutationFn: (planId) => adminApi.deleteSubscriptionPlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries(['subscription-plans']);
      setDeleteConfirm({ open: false, plan: null });
    },
  });

  const plans = data?.plans ?? [];
  const pagination = data?.pagination ?? { total: 0 };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(amount || 0);

  return (
    <>
      <PageHeader
        title="Subscription Plans"
        subtitle="Manage subscription plans for passengers"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            Add Plan
          </Button>
        }
      />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>Failed to load plans.</Alert>
      )}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Rides</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Validity (days)</TableCell>
                <TableCell>Status</TableCell>
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
              ) : plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No plans yet. Create one to get started.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                plans.map((plan) => (
                  <TableRow key={plan._id} hover>
                    <TableCell>
                      <Typography fontWeight="medium">{plan.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {plan.description || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>{plan.ridesIncluded ?? '—'}</TableCell>
                    <TableCell>{formatCurrency(plan.price)}</TableCell>
                    <TableCell>{plan.validityDays ?? '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={plan.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={plan.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => setEditPlan(plan)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteConfirm({ open: true, plan })}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={pagination.total}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </TableContainer>
      </Paper>

      <PlanFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries(['subscription-plans']);
          setCreateOpen(false);
        }}
      />
      <PlanFormDialog
        open={!!editPlan}
        onClose={() => setEditPlan(null)}
        plan={editPlan}
        onSuccess={() => {
          queryClient.invalidateQueries(['subscription-plans']);
          setEditPlan(null);
        }}
      />

      {deleteConfirm.open && deleteConfirm.plan && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography gutterBottom>
            Delete plan &quot;{deleteConfirm.plan.name}&quot;? This cannot be undone.
          </Typography>
          <Button
            color="error"
            variant="contained"
            onClick={() => deleteMutation.mutate(deleteConfirm.plan._id)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
          <Button sx={{ ml: 1 }} onClick={() => setDeleteConfirm({ open: false, plan: null })}>
            Cancel
          </Button>
        </Paper>
      )}
    </>
  );
};

export default SubscriptionsList;
