import { Box, Container } from '@mui/material';

const AuthLayout = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            backgroundColor: 'background.paper',
            borderRadius: 2,
            padding: 4,
            boxShadow: 3,
          }}
        >
          {children}
        </Box>
      </Container>
    </Box>
  );
};

export default AuthLayout;

