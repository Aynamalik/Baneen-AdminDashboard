import { Box, Grid, Paper, Typography } from '@mui/material';
import MainLayout from '../../components/layout/MainLayout';
import PageHeader from '../../components/common/PageHeader';
import {
  People as PeopleIcon,
  DirectionsCar as DirectionsCarIcon,
  LocalTaxi as LocalTaxiIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, color = 'primary' }) => {
  return (
    <Paper
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography color="text.secondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4">{value}</Typography>
        </Box>
        <Box
          sx={{
            color: `${color}.main`,
            fontSize: 48,
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );
};

const Dashboard = () => {
  return (
    <MainLayout>
      <PageHeader title="Dashboard" subtitle="Welcome to Baneen Admin Panel" />
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value="1,234"
            icon={<PeopleIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Drivers"
            value="456"
            icon={<DirectionsCarIcon />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Rides"
            value="23"
            icon={<LocalTaxiIcon />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value="PKR 123K"
            icon={<AttachMoneyIcon />}
            color="success"
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Dashboard content will be expanded in Phase 2 with charts and detailed analytics.
          </Typography>
        </Paper>
      </Box>
    </MainLayout>
  );
};

export default Dashboard;

