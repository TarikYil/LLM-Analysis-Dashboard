import React, { useState, useEffect, useRef } from 'react';
import {
  IconButton,
  Badge,
  Box,
  Tooltip,
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
} from '@mui/icons-material';
import NotificationPanel from './NotificationPanel';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationDropdown = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { unreadCount } = useNotifications();
  const anchorRef = useRef(null);

  const open = Boolean(anchorEl);

  // Dropdown aç/kapat
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          ref={anchorRef}
          onClick={handleClick}
          size="large"
          color="inherit"
          aria-label="notifications"
        >
          <Badge badgeContent={unreadCount} color="error">
            {unreadCount > 0 ? <NotificationsActive /> : <Notifications />}
          </Badge>
        </IconButton>
      </Tooltip>

      <NotificationPanel
        open={open}
        onClose={handleClose}
        anchorEl={anchorEl}
      />
    </>
  );
};

export default NotificationDropdown;