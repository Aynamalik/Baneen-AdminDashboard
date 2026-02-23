import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import PageHeader from '../../components/common/PageHeader';
import { adminApi } from '../../services/api/admin.api';

const defaultEnd = new Date();
const defaultStart = new Date();
defaultStart.setDate(defaultStart.getDate() - 30);

const Reports = () => {
  const [startDate, setStartDate] = useState(defaultStart.toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(defaultEnd.toISOString().slice(0, 10));

  const rideReportsQuery = useQuery({
    queryKey: ['reports-rides', startDate, endDate],
    queryFn: () =>
      adminApi.getRideReports({
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate + 'T23:59:59').toISOString(),
        groupBy: 'day',
      }),
  });

  const earningsQuery = useQuery({
    queryKey: ['reports-earnings', startDate, endDate],
    queryFn: () =>
      adminApi.getEarningsReports({
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate + 'T23:59:59').toISOString(),
        groupBy: 'day',
      }),
  });

  const rideData = (Array.isArray(rideReportsQuery.data) ? rideReportsQuery.data : [])
    .slice(0, 30)
    .reverse()
    .map((r) => ({
      date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      rides: r.totalRides ?? 0,
      completed: r.completedRides ?? 0,
      revenue: r.totalRevenue ?? 0,
    }));

  const earningsData = (Array.isArray(earningsQuery.data) ? earningsQuery.data : [])
    .slice(0, 30)
    .reverse()
    .map((r) => ({
      date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: r.totalRevenue ?? 0,
      transactions: r.transactionCount ?? 0,
    }));

  const formatCurrency = (v) =>
    new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(v);

  return (
    <>
      <PageHeader title="Reports" subtitle="Ride and earnings analytics" />

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            label="Start date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </Paper>

      {(rideReportsQuery.error || earningsQuery.error) && (
        <Alert severity="error" sx={{ mb: 2 }}>Failed to load reports.</Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Ride reports (by day)</Typography>
            <Box sx={{ height: 300 }}>
              {rideReportsQuery.isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress />
                </Box>
              ) : rideData.length === 0 ? (
                <Typography color="text.secondary">No data for this range.</Typography>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rideData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="rides" name="Total rides" fill="#9C27B0" />
                    <Bar dataKey="completed" name="Completed" fill="#4CAF50" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Earnings (by day)</Typography>
            <Box sx={{ height: 300 }}>
              {earningsQuery.isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress />
                </Box>
              ) : earningsData.length === 0 ? (
                <Typography color="text.secondary">No data for this range.</Typography>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={earningsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(v) => formatCurrency(v)} />
                    <Tooltip formatter={(value) => [typeof value === 'number' && value > 100 ? formatCurrency(value) : value, '']} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#E91E63" name="Revenue" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default Reports;
