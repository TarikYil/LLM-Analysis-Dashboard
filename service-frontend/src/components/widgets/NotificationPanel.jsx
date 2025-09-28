import React, { useState, useEffect } from 'react';
import {
  Box,
  Popover,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  CheckCircle,
  Info,
  Warning,
  Error,
  Delete,
  MarkEmailRead,
  Refresh,
} from '@mui/icons-material';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationPanel = ({ open, onClose, anchorEl }) => {
  const {
    notifications,
    unreadCount,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Bildirim ikonları
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'error':
        return <Error color="error" />;
      case 'info':
      default:
        return <Info color="info" />;
    }
  };

  // Bildirim rengi
  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'info':
      default:
        return 'info';
    }
  };

  // Time format
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US');
  };

  // Load notifications
  const handleLoadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      await loadNotifications();
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // Load notifications when panel opens
  useEffect(() => {
    if (open && notifications.length === 0) {
      handleLoadNotifications();
    }
  }, [open]);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: {
          width: 400,
          maxHeight: 500,
          mt: 1,
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2 
        }}>
          <Typography variant="h6" component="div">
            Notifications
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh">
              <IconButton 
                size="small" 
                onClick={handleLoadNotifications}
                disabled={loading}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
            {unreadCount > 0 && (
              <Button
                size="small"
                startIcon={<MarkEmailRead />}
                onClick={handleMarkAllAsRead}
                variant="outlined"
              >
                Mark All as Read
              </Button>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Content */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && notifications.length === 0 && (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Info sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        )}

        {!loading && !error && notifications.length > 0 && (
          <List sx={{ p: 0 }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    py: 1.5,
                    px: 2,
                    backgroundColor: notification.read ? 'transparent' : 'action.hover',
                    '&:hover': {
                      backgroundColor: 'action.selected',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: notification.read ? 'normal' : 'bold',
                            flexGrow: 1 
                          }}
                        >
                          {notification.title}
                        </Typography>
                        <Chip
                          label={notification.category}
                          size="small"
                          color={getNotificationColor(notification.type)}
                          variant="outlined"
                        />
                        {!notification.read && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: 'primary.main',
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                        >
                          {formatTime(notification.timestamp)}
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {!notification.read && (
                      <Tooltip title="Mark as read">
                        <IconButton
                          size="small"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <CheckCircle fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteNotification(notification.id)}
                        color="error"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Popover>
  );
};

export default NotificationPanel;