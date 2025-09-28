import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Help,
} from '@mui/icons-material';
import { useUIStore } from '../../store';
import NotificationDropdown from '../widgets/NotificationDropdown';

const Header = () => {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'background.paper',
        color: 'text.primary',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <Toolbar>
        {/* Menu Toggle Button */}
        <IconButton
          color="inherit"
          aria-label="toggle drawer"
          onClick={toggleSidebar}
          edge="start"
          sx={{ 
            mr: 2,
            ...(sidebarOpen && { display: { sm: 'none' } }),
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* App Title */}
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ 
            flexGrow: 0,
            fontWeight: 600,
            color: 'primary.main',
          }}
        >
          AI Reporting Agent
        </Typography>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Right side actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Help */}
          <IconButton
            size="large"
            color="inherit"
            aria-label="help"
            title="Help & Documentation"
          >
            <Help />
          </IconButton>

          {/* Notifications */}
          <NotificationDropdown />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
