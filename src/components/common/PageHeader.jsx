import { Box, Typography, Button } from '@mui/material';

const PageHeader = ({ title, subtitle, action, actionLabel }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && actionLabel && (
        <Button variant="contained" onClick={action}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default PageHeader;

