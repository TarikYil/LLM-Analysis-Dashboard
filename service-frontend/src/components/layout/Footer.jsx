import React from 'react';
import {
  Box,
  Typography,
  Container,
  Link,
  Divider,
} from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        mt: 'auto',
        py: 3,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', sm: 'center' },
            gap: 2,
          }}
        >
          {/* Left side - Company info */}
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              AI Reporting Agent Dashboard
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Powered by Advanced Analytics & Machine Learning
            </Typography>
          </Box>

          {/* Right side - Links and copyright */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              gap: { xs: 1, sm: 3 },
              textAlign: 'center',
            }}
          >
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Link
                href="/privacy"
                variant="caption"
                color="text.secondary"
                underline="hover"
                sx={{ '&:hover': { color: 'primary.main' } }}
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                variant="caption"
                color="text.secondary"
                underline="hover"
                sx={{ '&:hover': { color: 'primary.main' } }}
              >
                Terms of Service
              </Link>
              <Link
                href="/support"
                variant="caption"
                color="text.secondary"
                underline="hover"
                sx={{ '&:hover': { color: 'primary.main' } }}
              >
                Support
              </Link>
            </Box>
            
            <Divider 
              orientation="vertical" 
              flexItem 
              sx={{ 
                display: { xs: 'none', sm: 'block' },
                height: 20,
                alignSelf: 'center',
              }} 
            />
            
            <Typography variant="caption" color="text.secondary">
              © 2025 AI Reporting Agent. All rights reserved.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
