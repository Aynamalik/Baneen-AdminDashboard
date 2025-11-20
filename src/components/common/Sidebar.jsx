import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  DirectionsCar as DirectionsCarIcon,
  LocalTaxi as LocalTaxiIcon,
  Payment as PaymentIcon,
  CardMembership as CardMembershipIcon,
  ReportProblem as ReportProblemIcon,
  Emergency as EmergencyIcon,
  Assessment as AssessmentIcon,
  SmartToy as SmartToyIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { ROUTES } from '../../utils/constants';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: ROUTES.DASHBOARD },
  { text: 'Users', icon: <PeopleIcon />, path: ROUTES.USERS },
  { text: 'Drivers', icon: <DirectionsCarIcon />, path: ROUTES.DRIVERS },
  { text: 'Rides', icon: <LocalTaxiIcon />, path: ROUTES.RIDES },
  { text: 'Payments', icon: <PaymentIcon />, path: ROUTES.PAYMENTS },
  { text: 'Subscriptions', icon: <CardMembershipIcon />, path: ROUTES.SUBSCRIPTIONS },
  { text: 'Complaints', icon: <ReportProblemIcon />, path: ROUTES.COMPLAINTS },
  { text: 'SOS Alerts', icon: <EmergencyIcon />, path: ROUTES.SOS },
  { text: 'Reports', icon: <AssessmentIcon />, path: ROUTES.REPORTS },
  { text: 'Chatbot', icon: <SmartToyIcon />, path: ROUTES.CHATBOT },
  { text: 'Settings', icon: <SettingsIcon />, path: ROUTES.SETTINGS },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen } = useSelector((state) => state.ui);

  return (
    <Drawer
      variant="persistent"
      open={sidebarOpen}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === item.path ? 'primary.main' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
      </Box>
    </Drawer>
  );
};

export default Sidebar;

