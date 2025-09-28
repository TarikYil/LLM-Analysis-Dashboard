import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Collapse,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
} from '@mui/material';
import {
  Info,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Schedule,
  Error,
  Warning,
} from '@mui/icons-material';

const InfoPanel = ({ 
  title = "Component Information", 
  description = "Information about this component",
  features = [],
  processes = [],
  technologies = [],
  status = "active",
  lastUpdated = null,
  ...props 
}) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'processing': return 'warning';
      case 'error': return 'error';
      case 'inactive': return 'default';
      default: return 'info';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle />;
      case 'processing': return <Schedule />;
      case 'error': return <Error />;
      case 'inactive': return <Warning />;
      default: return <Info />;
    }
  };

  return (
    <Card 
      sx={{ 
        border: '1px solid', 
        borderColor: 'divider',
        '&:hover': {
          boxShadow: 2,
        },
        ...props.sx 
      }}
    >
      <CardContent sx={{ p: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Info color="primary" fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            <Chip
              icon={getStatusIcon(status)}
              label={status}
              size="small"
              color={getStatusColor(status)}
              variant="outlined"
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          </Box>
          <IconButton 
            size="small" 
            onClick={() => setExpanded(!expanded)}
            sx={{ p: 0.5 }}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        {/* Description */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {description}
        </Typography>

        {/* Collapsible Content */}
        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            {/* Features */}
            {features.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Key Features
                </Typography>
                <List dense>
                  {features.map((feature, index) => (
                    <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={feature}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Processes */}
            {processes.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Process Flow
                </Typography>
                <List dense>
                  {processes.map((process, index) => (
                    <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <Box 
                          sx={{ 
                            width: 20, 
                            height: 20, 
                            borderRadius: '50%', 
                            bgcolor: 'primary.main',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {index + 1}
                        </Box>
                      </ListItemIcon>
                      <ListItemText 
                        primary={process}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Technologies */}
            {technologies.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Technologies Used
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {technologies.map((tech, index) => (
                    <Chip
                      key={index}
                      label={tech}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Last Updated */}
            {lastUpdated && (
              <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">
                  Last updated: {new Date(lastUpdated).toLocaleString()}
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default InfoPanel;
