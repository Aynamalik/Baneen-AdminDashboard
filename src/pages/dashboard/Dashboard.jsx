import { useQuery } from '@tanstack/react-query';
import { Box, Paper, Typography, Grid, Alert, CircularProgress } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import PageHeader from '../../components/common/PageHeader';
import { adminApi } from '../../services/api/admin.api';
import {
  People as PeopleIcon,
  DirectionsCar as DirectionsCarIcon,
  LocalTaxi as LocalTaxiIcon,
  CurrencyRupee as CurrencyRupeeIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, color = 'primary', subtitle, isLoading }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
          }}
        >
          <CircularProgress size={20} />
        </Box>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography color="text.secondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4">{value}</Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {subtitle}
            </Typography>
          )}
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
  // Fetch dashboard statistics
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: adminApi.getDashboardStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch active rides
  const {
    data: activeRides,
    isLoading: ridesLoading,
  } = useQuery({
    queryKey: ['active-rides'],
    queryFn: adminApi.getActiveRides,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Fetch ride reports for charts (last 7 days); API returns array directly
  const {
    data: rideReports,
    isLoading: reportsLoading,
  } = useQuery({
    queryKey: ['ride-reports-chart'],
    queryFn: () => adminApi.getRideReports({
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
      groupBy: 'day'
    }),
    refetchInterval: 300000,
  });

  // API client returns unwrapped data (stats = dashboard stats object, rideReports = array)
  const rideStatusData = [
    { name: 'Completed', value: stats?.completedRidesToday || 0, color: '#4CAF50' },
    { name: 'Active', value: stats?.activeRides || 0, color: '#2196F3' },
    { name: 'Cancelled', value: stats?.cancelledRidesToday || 0, color: '#F44336' },
  ];

  const revenueData = (Array.isArray(rideReports) ? rideReports : [])?.slice(0, 7).reverse().map(report => ({
    date: new Date(report.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: report.totalRevenue || 0,
    rides: report.totalRides || 0
  })) || [];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3, mt: 0 }}>
        <Box
          component="img"
          src="/baneen-logo.png"
          alt="Baneen - female journeys"
          sx={{
            height: 200,
            objectFit: 'contain',
            flexShrink: 0,
          }}
        />
        <Box>
          <PageHeader title="Dashboard" subtitle="Welcome to Baneen Admin Panel" />
        </Box>
      </Box>

      {statsError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load dashboard statistics. Please check your connection.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={statsLoading ? '...' : formatNumber(stats?.totalUsers || 0)}
            subtitle={stats?.newUsersToday ? `${stats.newUsersToday} new today` : ''}
            icon={<PeopleIcon />}
            color="primary"
            isLoading={statsLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Drivers"
            value={statsLoading ? '...' : formatNumber(stats?.totalDrivers || 0)}
            subtitle={stats?.activeDrivers ? `${stats.activeDrivers} active` : ''}
            icon={<DirectionsCarIcon />}
            color="secondary"
            isLoading={statsLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Rides"
            value={ridesLoading ? '...' : formatNumber(Array.isArray(activeRides) ? activeRides.length : 0)}
            subtitle="Currently ongoing"
            icon={<LocalTaxiIcon />}
            color="info"
            isLoading={ridesLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Revenue"
            value={statsLoading ? '...' : formatCurrency(stats?.todayRevenue || 0)}
            subtitle={stats?.monthlyRevenue ? `This month: ${formatCurrency(stats.monthlyRevenue)}` : ''}
            icon={<CurrencyRupeeIcon />}
            color="success"
            isLoading={statsLoading}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {/* Revenue Chart */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <Typography variant="h6" gutterBottom>
                Revenue Trend (Last 7 Days)
              </Typography>
              <Box sx={{ height: 300, width: '100%' }}>
                {reportsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [
                        name === 'revenue' ? formatCurrency(value) : value,
                        name === 'revenue' ? 'Revenue' : 'Rides'
                      ]} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#E91E63"
                        strokeWidth={3}
                        name="Revenue"
                      />
                      <Line
                        type="monotone"
                        dataKey="rides"
                        stroke="#9C27B0"
                        strokeWidth={2}
                        name="Rides"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Ride Status Distribution */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <Typography variant="h6" gutterBottom>
                Today&apos;s Ride Status
              </Typography>
              <Box sx={{ height: 300, width: '100%' }}>
                {statsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={rideStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {rideStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Pending Driver Approvals</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {statsLoading ? '...' : stats?.pendingDrivers || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Active SOS Alerts</Typography>
                  <Typography variant="body2" fontWeight="bold" color="error.main">
                    {statsLoading ? '...' : stats?.activeSOSAlerts || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Total Rides Today</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {statsLoading ? '...' : formatNumber(stats?.todayRides || 0)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Completed Rides Today</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {statsLoading ? '...' : formatNumber(stats?.completedRidesToday || 0)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Completion Rate</Typography>
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    {statsLoading ? '...' : `${stats?.completionRate || 0}%`}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {statsLoading ? (
                  <Typography variant="body2" color="text.secondary">
                    Loading recent activity...
                  </Typography>
                ) : (
                  <>
                    {stats?.recentActivity?.length > 0 ? (
                      stats.recentActivity.map((activity, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TrendingUpIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="body2">
                            {activity.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {activity.timestamp}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No recent activity to display.
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default Dashboard;

