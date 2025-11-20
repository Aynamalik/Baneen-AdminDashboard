import { Box, Toolbar } from '@mui/material';
import Header from '../common/Header';
import Sidebar from '../common/Sidebar';
import Footer from '../common/Footer';

const DashboardLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - 240px)` },
            backgroundColor: 'background.default',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Toolbar />
          <Box sx={{ flex: 1 }}>
            {children}
          </Box>
          <Footer />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;

