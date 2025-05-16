import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const AdminSettings = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          הגדרות מערכת
        </Typography>
      </Box>
    </Container>
  );
};

export default AdminSettings;
