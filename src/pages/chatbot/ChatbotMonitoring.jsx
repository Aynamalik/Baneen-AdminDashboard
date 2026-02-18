import {
  Box,
  Paper,
  Typography,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import {
  SmartToy as SmartToyIcon,
  Chat as ChatIcon,
  TrendingUp as TrendingUpIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';

const ChatbotMonitoring = () => {
  return (
    <>
      <PageHeader
        title="Chatbot Monitoring"
        subtitle="Monitor AI chatbot conversations and analytics"
      />

      <Alert severity="info" sx={{ mb: 3 }}>
        Chatbot monitoring features are being developed. Analytics and conversation logs will be available once the backend integration is complete.
      </Alert>

      {/* Placeholder Stats */}
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
              <Typography variant="h4">—</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SmartToyIcon color="secondary" />
                <Typography variant="body2" color="text.secondary">
                  Resolved Queries
                </Typography>
              </Box>
              <Typography variant="h4">—</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon color="success" />
                <Typography variant="body2" color="text.secondary">
                  Avg. Resolution Time
                </Typography>
              </Box>
              <Typography variant="h4">—</Typography>
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
              <Typography variant="h4">—</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Placeholder Content */}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Recent Conversations
        </Typography>
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
          <Typography variant="body1">
            Conversation logs will appear here once the chatbot analytics API is implemented.
          </Typography>
          <Chip label="Coming Soon" color="primary" sx={{ mt: 2 }} />
        </Box>
      </Paper>
    </>
  );
};

export default ChatbotMonitoring;
