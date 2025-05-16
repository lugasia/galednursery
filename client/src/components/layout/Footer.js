import React from 'react';
import { Box, Container, Typography, Link, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <Box component="footer" sx={{ bgcolor: '#f5f5f5', py: 3, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            © {currentYear} משתלת קיבוץ גלעד. כל הזכויות שמורות.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, md: 0 } }}>
            <Link component={RouterLink} to="/" color="inherit" underline="hover">
              דף הבית
            </Link>
            <Link component={RouterLink} to="/cart" color="inherit" underline="hover">
              עגלת קניות
            </Link>
            <Link component={RouterLink} to="/admin/login" color="inherit" underline="hover">
              ניהול
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
