import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/common/PageHeader';
import { adminApi } from '../../services/api/admin.api';
import {
  SmartToy as SmartToyIcon,
  Chat as ChatIcon,
  TrendingUp as TrendingUpIcon,
  Psychology as PsychologyIcon,
  RecordVoiceOver as VoiceIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

const ChatbotMonitoring = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [typeFilter, setTypeFilter] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  const analyticsParams = {};
  if (dateRange.startDate) analyticsParams.startDate = dateRange.startDate;
  if (dateRange.endDate) analyticsParams.endDate = dateRange.endDate;

  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useQuery({
    queryKey: ['chatbot-analytics', analyticsParams],
    queryFn: () => adminApi.getChatbotAnalytics(analyticsParams),
  });

  const { data: conversationsData, isLoading: conversationsLoading } = useQuery({
    queryKey: ['chatbot-conversations', page, rowsPerPage, typeFilter],
    queryFn: () =>
      adminApi.getChatbotConversations({
        page: page + 1,
        limit: rowsPerPage,
        type: typeFilter || undefined,
      }),
  });

  const conversations = conversationsData?.conversations || [];
  const pagination = conversationsData?.pagination || { total: 0, totalPages: 0 };

  const topIntent =
    analytics?.intentDistribution && Object.keys(analytics.intentDistribution).length > 0
      ? Object.entries(analytics.intentDistribution).sort((a, b) => b[1] - a[1])[0]
      : null;

  return (
    <>
      <PageHeader
        title="Chatbot Monitoring"
        subtitle="Monitor AI chatbot and voice conversations and analytics"
      />

      {analyticsError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load analytics. {analyticsError?.message}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ChatIcon color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Total Conversations
                </Typography>
              </Box>
              <Typography variant="h4">
                {analyticsLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  analytics?.totalConversations ?? 0
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SmartToyIcon color="secondary" />
                <Typography variant="body2" color="text.secondary">
                  Total Messages
                </Typography>
              </Box>
              <Typography variant="h4">
                {analyticsLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  analytics?.totalMessages ?? 0
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PsychologyIcon color="info" />
                <Typography variant="body2" color="text.secondary">
                  Top Intent
                </Typography>
              </Box>
              <Typography variant="h4">
                {analyticsLoading ? (
                  <CircularProgress size={24} />
                ) : topIntent ? (
                  <Chip label={topIntent[0]} size="small" color="primary" />
                ) : (
                  '—'
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon color="success" />
                <Typography variant="body2" color="text.secondary">
                  Chat vs Voice
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {analyticsLoading ? (
                  <CircularProgress size={24} />
                ) : analytics?.typeDistribution ? (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {analytics.typeDistribution.chat != null && (
                      <Chip
                        icon={<MessageIcon />}
                        label={`Chat: ${analytics.typeDistribution.chat}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {analytics.typeDistribution.voice != null && (
                      <Chip
                        icon={<VoiceIcon />}
                        label={`Voice: ${analytics.typeDistribution.voice}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {!analytics.typeDistribution.chat && !analytics.typeDistribution.voice && '—'}
                  </Box>
                ) : (
                  '—'
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Date range filter for analytics */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          type="date"
          label="From"
          value={dateRange.startDate}
          onChange={(e) => setDateRange((p) => ({ ...p, startDate: e.target.value }))}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 160 }}
        />
        <TextField
          size="small"
          type="date"
          label="To"
          value={dateRange.endDate}
          onChange={(e) => setDateRange((p) => ({ ...p, endDate: e.target.value }))}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 160 }}
        />
      </Box>

      {/* Conversations Table */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h6">Recent Conversations</Typography>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              label="Type"
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="chat">Chat</MenuItem>
              <MenuItem value="voice">Voice</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {conversationsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : conversations.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 6,
              color: 'text.secondary',
            }}
          >
            <SmartToyIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
            <Typography variant="body1">No conversation logs yet.</Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Intent</TableCell>
                    <TableCell>Input</TableCell>
                    <TableCell>Response</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {conversations.map((conv) => (
                    <TableRow key={conv._id} hover>
                      <TableCell>
                        {conv.createdAt
                          ? format(new Date(conv.createdAt), 'MMM d, yyyy HH:mm')
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {conv.user?.email || conv.user?.phone || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={conv.type || '—'}
                          size="small"
                          color={conv.type === 'voice' ? 'secondary' : 'primary'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{conv.intent || '—'}</TableCell>
                      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {conv.input || '—'}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {conv.response || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={pagination.total || 0}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 20, 50]}
            />
          </>
        )}
      </Paper>
    </>
  );
};

export default ChatbotMonitoring;
