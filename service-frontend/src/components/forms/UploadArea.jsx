import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload,
  Description,
  Delete,
  CheckCircle,
  Error,
  Info,
} from '@mui/icons-material';
import { reportAPI } from '../../services/api';
import { useReportsStore, useUIStore, useDashboardStore } from '../../store';

const ACCEPTED_FILE_TYPES = {
  'application/pdf': '.pdf',
  'text/csv': '.csv',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const UploadArea = ({ onUploadComplete, ...props }) => {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  
  const { addReport, setUploadProgress } = useReportsStore();
  const { addNotification } = useUIStore();
  const { setKPIs, setTrends, setInsights } = useDashboardStore();

  const validateFile = (file) => {
    if (!Object.keys(ACCEPTED_FILE_TYPES).includes(file.type)) {
      return `File type ${file.type} is not supported. Please upload PDF, CSV, or Excel files.`;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the maximum limit of 50MB.`;
    }
    
    return null;
  };

  const handleFiles = useCallback((newFiles) => {
    const validFiles = [];
    const errors = [];

    Array.from(newFiles).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push({ file: file.name, error });
      } else {
        validFiles.push({
          file,
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'pending',
        });
      }
    });

    if (errors.length > 0) {
      setError(`Some files were rejected: ${errors.map(e => e.error).join(', ')}`);
    } else {
      setError(null);
    }

    setFiles(prev => [...prev, ...validFiles]);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    handleFiles(droppedFiles);
  }, [handleFiles]);

  const handleFileSelect = useCallback((e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      handleFiles(selectedFiles);
    }
  }, [handleFiles]);

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const uploadFile = async (fileItem) => {
    try {
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, status: 'uploading' } : f
      ));

      const response = await reportAPI.uploadReport(fileItem.file, {
        onProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, status: 'completed', result: response } : f
      ));

      // Add to reports store
      const reportId = response.data?.reportId || response.reportId || `report-${Date.now()}`;
      const reportData = {
        id: reportId,
        name: fileItem.name,
        type: fileItem.type,
        size: fileItem.size,
        uploadDate: new Date().toISOString(),
        status: 'processed',
        ...response,
        ...response.data,
      };
      
      console.log('📁 Upload response:', response);
      console.log('📁 Extracted reportId:', reportId);
      
      addReport(reportData);
      
      // Set as current report for immediate use
      const { setCurrentReport } = useReportsStore.getState();
      setCurrentReport(reportData);
      
      console.log('📁 Upload completed, report set:', reportData);

      addNotification({
        type: 'success',
        message: `${fileItem.name} uploaded successfully`,
      });

      // Automatically fetch KPI, trend and insights data
      try {
        console.log('🔄 Starting automatic data fetch...');
        
        // Fetch KPI data
        const kpiData = await reportAPI.getKPIs(reportId);
        setKPIs(kpiData);
        console.log('📊 KPI data received:', kpiData);
        
        // Fetch trend data
        const trendData = await reportAPI.getTrends(reportId);
        setTrends(trendData);
        console.log('📈 Trend data received:', trendData);
        
        // Fetch insights data
        const insightsData = await reportAPI.getInsights(reportId);
        setInsights(insightsData);
        console.log('💡 Insights data received:', insightsData);
        
        addNotification({
          type: 'success',
          message: 'All analysis data automatically loaded',
        });
      } catch (autoError) {
        console.warn('Automatic data fetch error:', autoError);
        addNotification({
          type: 'warning',
          message: 'File uploaded but automatic analysis data could not be retrieved',
        });
      }

      if (onUploadComplete) {
        onUploadComplete(response);
      }

    } catch (error) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, status: 'error', error: error.message } : f
      ));

      addNotification({
        type: 'error',
        message: `Failed to upload ${fileItem.name}: ${error.message}`,
      });
    }
  };

  const uploadAllFiles = async () => {
    setUploading(true);
    setError(null);

    const pendingFiles = files.filter(f => f.status === 'pending');
    
    try {
      for (const file of pendingFiles) {
        await uploadFile(file);
      }
    } catch (error) {
      setError('Some uploads failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return <Description sx={{ color: 'error.main' }} />;
    if (type.includes('csv') || type.includes('excel') || type.includes('sheet')) {
      return <Description sx={{ color: 'success.main' }} />;
    }
    return <Description />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'uploading': return 'primary';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'error': return <Error sx={{ color: 'error.main' }} />;
      default: return null;
    }
  };

  return (
    <Box {...props}>
      {/* Upload Area */}
      <Paper
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          p: 4,
          border: '2px dashed',
          borderColor: dragOver ? 'primary.main' : 'divider',
          backgroundColor: dragOver ? 'action.hover' : 'background.paper',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover',
          },
        }}
      >
        <CloudUpload 
          sx={{ 
            fontSize: 48, 
            color: dragOver ? 'primary.main' : 'text.secondary',
            mb: 2,
          }} 
        />
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
            Drop files here or click to upload
          </Typography>
          <Tooltip 
            title="Upload PDF, CSV, or Excel files up to 50MB for AI analysis. Files are automatically processed and analyzed."
            arrow
          >
            <Info sx={{ color: 'text.secondary', fontSize: 20 }} />
          </Tooltip>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Support for PDF, CSV, and Excel files up to 50MB
        </Typography>
        
        <input
          type="file"
          multiple
          accept={Object.values(ACCEPTED_FILE_TYPES).join(',')}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="file-upload-input"
        />
        
        <label htmlFor="file-upload-input">
          <Button variant="contained" component="span" startIcon={<CloudUpload />}>
            Select Files
          </Button>
        </label>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* File List */}
      {files.length > 0 && (
        <Paper sx={{ mt: 2 }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6">
              Selected Files ({files.length})
            </Typography>
          </Box>
          
          <List>
            {files.map((fileItem) => (
              <ListItem key={fileItem.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                  {getFileIcon(fileItem.type)}
                </Box>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1">
                        {fileItem.name}
                      </Typography>
                      <Chip
                        label={fileItem.status}
                        size="small"
                        color={getStatusColor(fileItem.status)}
                        icon={getStatusIcon(fileItem.status)}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {(fileItem.size / 1024 / 1024).toFixed(1)} MB
                      </Typography>
                      {fileItem.status === 'uploading' && (
                        <LinearProgress sx={{ mt: 1 }} />
                      )}
                      {fileItem.error && (
                        <Typography variant="caption" color="error.main">
                          {fileItem.error}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                
                <ListItemSecondaryAction>
                  {fileItem.status === 'pending' && (
                    <IconButton 
                      edge="end" 
                      onClick={() => removeFile(fileItem.id)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          
          {/* Upload Button */}
          {files.some(f => f.status === 'pending') && (
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button
                variant="contained"
                onClick={uploadAllFiles}
                disabled={uploading}
                startIcon={<CloudUpload />}
                fullWidth
              >
                {uploading ? 'Uploading...' : `Upload ${files.filter(f => f.status === 'pending').length} File(s)`}
              </Button>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default UploadArea;
