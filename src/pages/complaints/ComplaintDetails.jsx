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
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/common/PageHeader';
import { adminApi } from '../../services/api/admin.api';
import { ROUTES } from '../../utils/constants';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  ReportProblem as ReportProblemIcon,
  Person as PersonIcon,
  DriveEta as DriveEtaIcon,
  Apps as AppsIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [resolveDialog, setResolveDialog] = useState({
    open: false,
    resolution: '',
    adminNotes: '',
    action: '',
  });

  // Fetch complaint details
  const {
    data: complaintData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['complaint-details', id],
    queryFn: () => adminApi.getComplaintDetails(id),
    enabled: !!id,
  });

  // Resolve complaint mutation
  const resolveMutation = useMutation({
    mutationFn: (resolutionData) =>
      adminApi.resolveComplaint(id, resolutionData),
    onSuccess: () => {
      queryClient.invalidateQueries(['complaint-details', id]);
      queryClient.invalidateQueries(['complaints']);
      setResolveDialog({ open: false, resolution: '', adminNotes: '', action: '' });
    },
  });

  const handleResolveComplaint = () => {
    setResolveDialog({
      open: true,
      resolution: '',
      adminNotes: '',
      action: '',
    });
  };

  const handleResolveSubmit = () => {
    if (resolveDialog.resolution.trim()) {
      resolveMutation.mutate({
        resolution: resolveDialog.resolution,
        adminNotes: resolveDialog.adminNotes,
        action: resolveDialog.action,
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
        return <DriveEtaIcon />;
      case 'passenger':
        return <PersonIcon />;
      case 'app':
        return <AppsIcon />;
      default:
        return <ReportProblemIcon />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (error || !complaintData?.data) {
    return (
      <>
        <Alert severity="error" sx={{ mt: 2 }}>
          Failed to load complaint details. Please try again.
        </Alert>
      </>
    );
  }

  const complaint = complaintData.data;

  return (
    <>
      <PageHeader
        title={`Complaint #${complaint._id.slice(-8)}`}
        subtitle={`Filed by ${complaint.complainantId?.name || 'Unknown'} against ${complaint.targetId?.name || 'Unknown'}`}
        icon={<ReportProblemIcon />}
        action={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(ROUTES.COMPLAINTS)}
          >
            Back to Complaints
          </Button>
        }
      />

      <Grid container spacing={3}>
        {/* Complaint Overview */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Complaint Details
                  </Typography>
                  <Chip
                    label={complaint.status}
                    color={getStatusColor(complaint.status)}
                    size="small"
                  />
                </Box>
                {complaint.status === 'pending' && (
                  <Button
                    variant="contained"
                    startIcon={<CheckCircleIcon />}
                    onClick={handleResolveComplaint}
                  >
                    Resolve Complaint
                  </Button>
                )}
              </Box>

              <Divider sx={{ mb: 2 }} />

              <List>
                <ListItem>
                  <ListItemIcon>
                    <DescriptionIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Description"
                    secondary={complaint.description}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <AccessTimeIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Filed On"
                    secondary={formatDate(complaint.createdAt)}
                  />
                </ListItem>

                {complaint.status === 'resolved' && complaint.resolvedAt && (
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Resolved On"
                      secondary={formatDate(complaint.resolvedAt)}
                    />
                  </ListItem>
                )}

                {complaint.resolution && (
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Resolution"
                      secondary={complaint.resolution}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>

          {/* Related Ride Information */}
          {complaint.rideId && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Related Ride
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Ride ID
                    </Typography>
                    <Typography variant="body1">
                      {complaint.rideId._id.slice(-8)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={complaint.rideId.status}
                      size="small"
                      color={
                        complaint.rideId.status === 'completed' ? 'success' :
                        complaint.rideId.status === 'cancelled' ? 'error' :
                        'primary'
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Pickup Location
                    </Typography>
                    <Typography variant="body1">
                      {complaint.rideId.pickupLocation?.address || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Destination
                    </Typography>
                    <Typography variant="body1">
                      {complaint.rideId.destination?.address || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Complainant and Target Information */}
        <Grid item xs={12} lg={4}>
          {/* Complainant Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon />
                Complainant ({complaint.complainantType})
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2 }}>
                  {complaint.complainantType === 'passenger' ? (
                    <PersonIcon />
                  ) : (
                    <DriveEtaIcon />
                  )}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {complaint.complainantId?.name || 'Unknown'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {complaint.complainantType}
                  </Typography>
                </Box>
              </Box>

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={complaint.complainantId?.email || 'N/A'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Phone"
                    secondary={complaint.complainantId?.phone || 'N/A'}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Target Card */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getTargetTypeIcon(complaint.targetType)}
                Target ({complaint.targetType})
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2 }}>
                  {getTargetTypeIcon(complaint.targetType)}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {complaint.targetId?.name || 'Unknown'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {complaint.targetType}
                  </Typography>
                </Box>
              </Box>

              {complaint.targetType !== 'app' && (
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email"
                      secondary={complaint.targetId?.email || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone"
                      secondary={complaint.targetId?.phone || 'N/A'}
                    />
                  </ListItem>
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
            {resolveMutation.isPending ? <CircularProgress size={20} /> : 'Resolve Complaint'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ComplaintDetails;