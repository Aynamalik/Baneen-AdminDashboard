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
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/common/PageHeader';
import { adminApi } from '../../services/api/admin.api';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { ROUTES } from '../../utils/constants';

const UsersList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
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

  // Fetch users with filters
  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['users', page, rowsPerPage, search, roleFilter, statusFilter],
    queryFn: () => adminApi.getUsers({
      page: page + 1,
      limit: rowsPerPage,
      search: search || undefined,
      role: roleFilter || undefined,
      status: statusFilter || undefined,
    }),
  });

  // Mutations for user actions
  const verifyMutation = useMutation({
    mutationFn: (userId) => adminApi.verifyUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      closeConfirmDialog();
    },
  });

  const blockMutation = useMutation({
    mutationFn: (userId) => adminApi.blockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      closeConfirmDialog();
    },
  });

  const unblockMutation = useMutation({
    mutationFn: (userId) => adminApi.unblockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      closeConfirmDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId) => adminApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      closeConfirmDialog();
    },
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleAction = (action) => {
    if (!selectedUser) return;

    const actions = {
      verify: {
        title: 'Verify User',
        message: `Are you sure you want to verify ${selectedUser.name}?`,
        action: () => verifyMutation.mutate(selectedUser._id),
      },
      block: {
        title: 'Block User',
        message: `Are you sure you want to block ${selectedUser.name}? They will not be able to use the app.`,
        action: () => blockMutation.mutate(selectedUser._id),
      },
      unblock: {
        title: 'Unblock User',
        message: `Are you sure you want to unblock ${selectedUser.name}?`,
        action: () => unblockMutation.mutate(selectedUser._id),
      },
      delete: {
        title: 'Delete User',
        message: `Are you sure you want to permanently delete ${selectedUser.name}? This action cannot be undone.`,
        action: () => deleteMutation.mutate(selectedUser._id),
      },
    };

    setConfirmDialog({
      open: true,
      ...actions[action],
    });
    handleMenuClose();
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

  return (
    <>
      <PageHeader
        title="User Management"
        subtitle="Manage all users in the system"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(ROUTES.USERS_CREATE)}
          >
            Add User
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load users. Please try again.
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search users..."
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
            label="Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">All Roles</MenuItem>
            <MenuItem value="passenger">Passenger</MenuItem>
            <MenuItem value="driver">Driver</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>

          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
            <MenuItem value="blocked">Blocked</MenuItem>
            <MenuItem value="verified">Verified</MenuItem>
            <MenuItem value="unverified">Unverified</MenuItem>
          </TextField>

          <Button
            startIcon={<FilterListIcon />}
            onClick={() => {
              setSearch('');
              setRoleFilter('');
              setStatusFilter('');
            }}
          >
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {/* Users Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>CNIC</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Registered</TableCell>
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
              ) : usersData?.users?.length > 0 ? (
                usersData.users.map((user) => (
                  <TableRow
                    key={user._id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/users/${user._id}`)}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {user.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" fontWeight="medium">
                          {user.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        color={user.role === 'admin' ? 'secondary' : 'primary'}
                        variant={user.role === 'admin' ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{user.cnic}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(user)}
                        size="small"
                        color={getStatusColor(user)}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <IconButton onClick={(e) => handleMenuOpen(e, user)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {usersData?.pagination && (
          <TablePagination
            component="div"
            count={usersData.pagination.total}
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
          navigate(`/users/${selectedUser?._id}`);
        }}>
          <VisibilityIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        {!selectedUser?.isVerified && (
          <MenuItem onClick={() => handleAction('verify')}>
            <CheckCircleIcon sx={{ mr: 1 }} />
            Verify User
          </MenuItem>
        )}
        {!selectedUser?.isBlocked ? (
          <MenuItem onClick={() => handleAction('block')}>
            <BlockIcon sx={{ mr: 1 }} />
            Block User
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleAction('unblock')}>
            <CheckCircleIcon sx={{ mr: 1 }} />
            Unblock User
          </MenuItem>
        )}
        <MenuItem onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete User
        </MenuItem>
      </Menu>

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

export default UsersList;