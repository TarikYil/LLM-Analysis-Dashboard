import React, { useState } from 'react';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
  Divider,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Dashboard,
  Add,
  Description,
  Settings,
  Help,
  ChevronLeft,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUIStore, useReportsStore, useDashboardStore } from '../../store';
import SettingsModal from '../widgets/SettingsModal';

const DRAWER_WIDTH = 280;

const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { reports, currentReport, setCurrentReport, addReport } = useReportsStore();
  const { clearDashboard } = useDashboardStore();
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleDrawerClose = () => {
    setSidebarOpen(false);
  };

  const handleNewAnalysis = () => {
    // If there's a current report, move it to recent reports
    if (currentReport) {
      addReport(currentReport);
    }
    
    // Clear dashboard data
    clearDashboard();
    
    // Clear current report
    setCurrentReport(null);
  };

  const menuItems = [
    { 
      text: 'Dashboard', 
      icon: <Dashboard />, 
      path: '/',
      active: true 
    },
  ];

  const settingsItems = [
    { 
      text: 'Settings', 
      icon: <Settings />, 
      onClick: () => setSettingsModalOpen(true)
    },
    { 
      text: 'Help', 
      icon: <Help />, 
      onClick: () => navigate('/help')
    },
  ];

  return (
    <>
    <Drawer
      variant="persistent"
      anchor="left"
      open={sidebarOpen}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          minHeight: 64, // Match AppBar height
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
          Reports
        </Typography>
        <IconButton onClick={handleDrawerClose} size="small">
          <ChevronLeft />
        </IconButton>
      </Box>

      <Divider />

      {/* New Analysis Button */}
      <Box sx={{ p: 2 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<Add />}
          onClick={handleNewAnalysis}
          sx={{
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          New Analysis
        </Button>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
              selected={item.active}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: item.active ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mx: 2, my: 1 }} />

      {/* Recent Reports */}
      <Box sx={{ px: 2, py: 1 }}>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            color: 'text.secondary',
            fontWeight: 600,
            mb: 1 
          }}
        >
          Recent Reports
        </Typography>
        
        <List sx={{ p: 0 }}>
          {reports.slice(0, 5).map((report, index) => (
            <ListItem key={report.id || index} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => setCurrentReport(report)}
                sx={{
                  borderRadius: 1,
                  py: 0.5,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Description fontSize="small" />
                </ListItemIcon>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {report.name || `Report ${index + 1}`}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Chip
                      label={report.type || 'PDF'}
                      size="small"
                      sx={{
                        height: 16,
                        fontSize: '0.625rem',
                        backgroundColor: 'primary.light',
                        color: 'primary.contrastText',
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {report.date || '2 days ago'}
                    </Typography>
                  </Box>
                </Box>
              </ListItemButton>
            </ListItem>
          ))}
          
          {reports.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                No reports yet
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Upload your first report to get started
              </Typography>
            </Box>
          )}
        </List>
      </Box>

      {/* Spacer */}
      <Box sx={{ flexGrow: 1 }} />

      {/* Settings Section */}
      <List sx={{ px: 1, pb: 2 }}>
        <Divider sx={{ mx: 1, mb: 1 }} />
        {settingsItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={item.onClick}
              sx={{
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>

    {/* Settings Modal */}
    <SettingsModal
      open={settingsModalOpen}
      onClose={() => setSettingsModalOpen(false)}
    />
  </>
  );
};

export default Sidebar;
