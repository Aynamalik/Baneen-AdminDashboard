import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#E91E63',
      light: '#F48FB1',
      dark: '#C2185B',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#9C27B0',
      light: '#BA68C8',
      dark: '#7B1FA2',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#F44336',
    },
    warning: {
      main: '#FF9800',
    },
    info: {
      main: '#2196F3',
    },
    success: {
      main: '#4CAF50',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
      disabled: '#BDBDBD',
    },
    divider: '#E0E0E0',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#E91E63',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#9C27B0',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(233, 30, 99, 0.1)',
    '0px 4px 8px rgba(233, 30, 99, 0.15)',
    '0px 6px 12px rgba(233, 30, 99, 0.2)',
    '0px 8px 16px rgba(233, 30, 99, 0.25)',
    '0px 10px 20px rgba(233, 30, 99, 0.3)',
    '0px 12px 24px rgba(233, 30, 99, 0.35)',
    '0px 14px 28px rgba(233, 30, 99, 0.4)',
    '0px 16px 32px rgba(233, 30, 99, 0.45)',
    '0px 18px 36px rgba(233, 30, 99, 0.5)',
    '0px 20px 40px rgba(233, 30, 99, 0.55)',
    '0px 22px 44px rgba(233, 30, 99, 0.6)',
    '0px 24px 48px rgba(233, 30, 99, 0.65)',
    '0px 26px 52px rgba(233, 30, 99, 0.7)',
    '0px 28px 56px rgba(233, 30, 99, 0.75)',
    '0px 30px 60px rgba(233, 30, 99, 0.8)',
    '0px 32px 64px rgba(233, 30, 99, 0.85)',
    '0px 34px 68px rgba(233, 30, 99, 0.9)',
    '0px 36px 72px rgba(233, 30, 99, 0.95)',
    '0px 38px 76px rgba(233, 30, 99, 1)',
    '0px 40px 80px rgba(233, 30, 99, 1)',
    '0px 42px 84px rgba(233, 30, 99, 1)',
    '0px 44px 88px rgba(233, 30, 99, 1)',
    '0px 46px 92px rgba(233, 30, 99, 1)',
    '0px 48px 96px rgba(233, 30, 99, 1)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #C2185B 0%, #7B1FA2 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 8px rgba(233, 30, 99, 0.1)',
        },
      },
    },
  },
});

export default theme;

