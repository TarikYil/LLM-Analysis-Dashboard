import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  Collapse,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  Refresh,
  CheckCircle,
  Error,
  Schedule,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { reportAPI } from '../../services/api';

const EmbeddingStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchEmbeddingStatus = async () => {
    setLoading(true);
    try {
      const response = await reportAPI.getEmbeddingStatus();
      setStatus(response.data);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Embedding status error:', error);
      setStatus({
        embedding_status: {
          status: 'error',
          message: 'Could not retrieve embedding status',
          progress: 0
        },
        ai_ready: false
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get status on initial load
    fetchEmbeddingStatus();
    
    // Check every 2 seconds if in processing state
    const interval = setInterval(() => {
      if (status?.embedding_status?.status === 'processing') {
        fetchEmbeddingStatus();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [status?.embedding_status?.status]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'primary';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle />;
      case 'processing':
        return <Schedule />;
      case 'error':
        return <Error />;
      default:
        return <Schedule />;
    }
  };

  const formatElapsedTime = (startTime) => {
    if (!startTime) return '';
    const elapsed = Math.floor((Date.now() - startTime * 1000) / 1000);
    if (elapsed < 60) return `${elapsed}s`;
    return `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`;
  };

  if (!status) {
    return null;
  }

  const { embedding_status, ai_ready, current_token } = status;

  return (
    <Paper sx={{ p: 2, borderRadius: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          AI Embedding Status
          <Chip
            icon={getStatusIcon(embedding_status.status)}
            label={embedding_status.status === 'processing' ? 'Processing' : 
                   embedding_status.status === 'completed' ? 'Completed' : 
                   embedding_status.status === 'error' ? 'Error' : 'Waiting'}
            color={getStatusColor(embedding_status.status)}
            size="small"
          />
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            disabled={loading}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
          <IconButton
            size="small"
            onClick={fetchEmbeddingStatus}
            disabled={loading}
          >
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Progress Bar */}
      {embedding_status.status === 'processing' && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={embedding_status.progress || 0}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            %{embedding_status.progress || 0} completed
          </Typography>
        </Box>
      )}

      {/* Status Message */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {embedding_status.message || 'No status information'}
      </Typography>

      {/* AI Ready Status */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          AI Ready:
        </Typography>
        <Chip
          label={ai_ready ? 'Yes' : 'No'}
          color={ai_ready ? 'success' : 'default'}
          size="small"
        />
      </Box>

      {/* Expanded Details */}
      <Collapse in={expanded}>
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          {current_token && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Token:</strong> {current_token}
            </Typography>
          )}
          
          {embedding_status.start_time && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Elapsed Time:</strong> {formatElapsedTime(embedding_status.start_time)}
            </Typography>
          )}
          
          {lastChecked && (
            <Typography variant="body2" color="text.secondary">
              <strong>Last Check:</strong> {lastChecked.toLocaleTimeString('en-US')}
            </Typography>
          )}
        </Box>
      </Collapse>

      {/* Status Alerts */}
      {embedding_status.status === 'error' && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <AlertTitle>Embedding Error</AlertTitle>
          {embedding_status.message}
        </Alert>
      )}

      {embedding_status.status === 'completed' && ai_ready && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <AlertTitle>AI Ready</AlertTitle>
          Embedding process completed. AI-powered analysis is now available.
        </Alert>
      )}

      {embedding_status.status === 'processing' && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <AlertTitle>Process in Progress</AlertTitle>
          Embedding process is continuing in the background. This process usually takes a few minutes.
        </Alert>
      )}
    </Paper>
  );
};

export default EmbeddingStatus;
