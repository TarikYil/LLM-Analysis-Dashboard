import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  ButtonGroup,
  Tooltip,
  CircularProgress,
  Alert,
  Chip,
  Collapse,
} from '@mui/material';
import {
  Summarize,
  TrendingUp,
  Assessment,
  TaskAlt,
  Compare,
  AutoAwesome,
  ExpandMore,
  ExpandLess,
  Info,
} from '@mui/icons-material';
import { reportAPI } from '../../services/api';
import { useReportsStore, useDashboardStore, useUIStore } from '../../store';
import ActionDisplay from './ActionDisplay';

const ActionBar = ({ reportId, disabled = false, ...props }) => {
  const [loading, setLoading] = useState({});
  const [results, setResults] = useState({});
  const [error, setError] = useState(null);
  const [expandedAction, setExpandedAction] = useState(null);
  const [embeddingStatus, setEmbeddingStatus] = useState(null);
  
  const { currentReport } = useReportsStore();
  const { setSummary, setKPIs, setTrends, setInsights, setActionItems } = useDashboardStore();
  const { addNotification } = useUIStore();

  // Check embedding status on component mount and when report changes
  useEffect(() => {
    // Always check embedding status, not just when report exists
    checkEmbeddingStatus();
    
    // Set up periodic check for embedding status
    const interval = setInterval(async () => {
      const status = await checkEmbeddingStatus();
      // Stop checking once embedding is completed
      if (status?.data?.ai_ready || status?.data?.embedding_status?.status === 'completed' || status?.data?.embedding_status?.progress === 100) {
        clearInterval(interval);
      }
    }, 20000); // Check every 20 seconds
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []); // Empty dependency array - run once on mount

  // Check embedding status
  const checkEmbeddingStatus = async () => {
    try {
      const data = await reportAPI.getEmbeddingStatus();
      console.log('📊 Embedding status response:', data);
      console.log('📊 Embedding status data.ai_ready:', data?.data?.ai_ready);
      setEmbeddingStatus(data);
      return data;
    } catch (error) {
      console.error('Embedding status check failed:', error);
      setEmbeddingStatus({ 
        embedding_status: { status: 'error', message: 'Status check failed' },
        ai_ready: false 
      });
      return null;
    }
  };

  // Check if AI actions are ready
  const isAIReady = () => {
    console.log('🔍 isAIReady check:', {
      embeddingStatus,
      ai_ready: embeddingStatus?.data?.ai_ready,
      status: embeddingStatus?.data?.embedding_status?.status,
      progress: embeddingStatus?.data?.embedding_status?.progress,
      full_status: embeddingStatus?.data?.embedding_status,
      raw_data: embeddingStatus?.data
    });
    
    // Backend response: { success: true, data: { embedding_status: {...}, ai_ready: true } }
    // Progress 100 ise aktif et
    const ready = embeddingStatus?.data?.ai_ready === true || 
                  embeddingStatus?.data?.embedding_status?.status === 'completed' ||
                  embeddingStatus?.data?.embedding_status?.progress === 100;
    console.log('✅ AI Ready result:', ready);
    return ready;
  };

  const actions = [
    {
      id: 'summary',
      label: 'Get Summary',
      icon: <Summarize />,
      color: 'primary',
      description: 'Get AI-generated summary of the report',
      action: reportAPI.getSummary,
      resultHandler: (data) => {
        console.log('📊 Summary resultHandler called with:', data);
        console.log('📊 Summary resultHandler - data type:', typeof data);
        console.log('📊 Summary resultHandler - data keys:', Object.keys(data || {}));
        console.log('📊 Summary resultHandler - data.data:', data.data);
        console.log('📊 Summary resultHandler - data.data type:', typeof data.data);
        console.log('📊 Summary resultHandler - data.data keys:', Object.keys(data.data || {}));
        
        // API response: { success: true, data: { summary: "...", ... } }
        const summaryData = data.data || data;
        console.log('📊 Summary resultHandler - summaryData:', summaryData);
        console.log('📊 Summary resultHandler - summaryData type:', typeof summaryData);
        console.log('📊 Summary resultHandler - summaryData keys:', Object.keys(summaryData || {}));
        console.log('📊 Summary resultHandler - summaryData.summary:', summaryData.summary);
        console.log('📊 Summary resultHandler - summaryData.summary type:', typeof summaryData.summary);
        
        console.log('📊 Summary resultHandler - Calling setSummary with:', summaryData);
        setSummary(summaryData);
        console.log('📊 Summary resultHandler - setSummary completed');
      },
      requiresAI: true, // Summary also requires AI
    },
    {
      id: 'actions',
      label: 'Action Items',
      icon: <TaskAlt />,
      color: 'success',
      description: 'Get actionable recommendations',
      action: reportAPI.getActions,
      resultHandler: (data) => setActionItems(data),
      requiresAI: true, // Actions require AI
    },
  ];

  const handleAction = async (actionItem) => {
    // Toggle expanded state
    if (expandedAction === actionItem.id) {
      setExpandedAction(null);
      return;
    }

    // Check if AI is required and ready
    if (actionItem.requiresAI && !isAIReady()) {
      addNotification({
        type: 'warning',
        message: 'Please wait until AI embedding process is completed...',
      });
      return;
    }

    // Check embedding status if AI is required
    if (actionItem.requiresAI) {
      const status = await checkEmbeddingStatus();
      console.log('🔍 Action status check:', {
        actionId: actionItem.id,
        status,
        ai_ready: status?.data?.ai_ready,
        embedding_status: status?.data?.embedding_status
      });
      
      if (!status?.data?.ai_ready) {
        addNotification({
          type: 'warning',
          message: 'AI embedding process is not yet completed. Please wait...',
        });
        return;
      }
    }

    // Temporary fix: use a default reportId if none exists
    const targetReportId = reportId || currentReport?.id || 'default-report-id';
    
    console.log('🎯 handleAction called:', {
      actionId: actionItem.id,
      targetReportId,
      hasReportId: !!reportId,
      hasCurrentReport: !!currentReport?.id,
      requiresAI: actionItem.requiresAI,
      isAIReady: isAIReady()
    });

    // Remove the blocking condition temporarily for testing
    // if (!reportId && !currentReport?.id) {
    //   addNotification({
    //     type: 'warning',
    //     message: 'Please select a report first',
    //   });
    //   return;
    // }
    
    if (actionItem.id === 'compare') {
      // TODO: Open compare dialog
      addNotification({
        type: 'info',
        message: 'Compare feature coming soon',
      });
      return;
    }

    setLoading(prev => ({ ...prev, [actionItem.id]: true }));
    setError(null);

    try {
      console.log('🚀 Starting API call:', {
        actionId: actionItem.id,
        targetReportId,
        actionFunction: actionItem.action.name
      });
      
      const result = await actionItem.action(targetReportId);
      
      console.log('✅ API response received:', {
        actionId: actionItem.id,
        result
      });
      console.log('✅ API response - result type:', typeof result);
      console.log('✅ API response - result keys:', Object.keys(result || {}));
      console.log('✅ API response - full result structure:', JSON.stringify(result, null, 2));
      
      // Check for summary in different possible locations
      if (result) {
        console.log('🔍 [ActionBar] Checking for summary in result:', {
          hasSummary: 'summary' in result,
          hasData: 'data' in result,
          hasResult: 'result' in result,
          hasResponse: 'response' in result,
          summaryLocation: result.summary ? 'direct' : 
                          result.data?.summary ? 'data.summary' :
                          result.result?.summary ? 'result.summary' :
                          result.response?.summary ? 'response.summary' : 'not found'
        });
      }
      
      setResults(prev => {
        const newResults = { ...prev, [actionItem.id]: result };
        console.log('✅ Setting results:', newResults);
        return newResults;
      });
      
      if (actionItem.resultHandler) {
        console.log('✅ Calling resultHandler for action:', actionItem.id);
        actionItem.resultHandler(result);
        console.log('✅ resultHandler completed for action:', actionItem.id);
      }

      // Expand the action to show results
      setExpandedAction(actionItem.id);

      addNotification({
        type: 'success',
        message: `${actionItem.label} completed successfully`,
      });

    } catch (error) {
      console.error(`${actionItem.id} error:`, error);
      setError(`${actionItem.label} failed: ${error.message}`);
      
      addNotification({
        type: 'error',
        message: `${actionItem.label} failed: ${error.message}`,
      });
    } finally {
      setLoading(prev => ({ ...prev, [actionItem.id]: false }));
    }
  };

  const isActionLoading = (actionId) => loading[actionId] || false;
  const hasActionResult = (actionId) => !!results[actionId];

  return (
    <Card {...props}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesome color="primary" />
              AI Actions
            </Typography>
            <Tooltip 
              title="AI-powered analysis actions for document processing, summary generation, and actionable insights extraction."
              arrow
            >
              <Info sx={{ color: 'text.secondary', fontSize: 18 }} />
            </Tooltip>
          </Box>
          
          {currentReport && (
            <Chip
              label={currentReport.name}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Desktop Button Group */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <ButtonGroup
            variant="outlined"
            sx={{ 
              width: '100%',
              '& .MuiButton-root': {
                flex: 1,
                flexDirection: 'column',
                gap: 0.5,
                py: 1.5,
                px: 1,
              }
            }}
          >
            {actions.map((action) => (
              <Tooltip key={action.id} title={action.description} arrow>
                <Button
                  color={action.color}
                  onClick={() => handleAction(action)}
                  disabled={disabled || isActionLoading(action.id) || (action.requiresAI && !isAIReady())}
                  sx={{
                    position: 'relative',
                    '&.Mui-disabled': {
                      opacity: 0.6,
                    },
                  }}
                >
                  {isActionLoading(action.id) ? (
                    <CircularProgress size={20} color={action.color} />
                  ) : (
                    <>
                      {action.icon}
                      <Typography variant="caption" sx={{ fontWeight: 500 }}>
                        {action.label}
                      </Typography>
                      {hasActionResult(action.id) && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: 'success.main',
                          }}
                        />
                      )}
                    </>
                  )}
                </Button>
              </Tooltip>
            ))}
          </ButtonGroup>
        </Box>

        {/* Mobile Button Stack */}
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {actions.map((action) => (
              <Button
                key={action.id}
                variant="outlined"
                color={action.color}
                startIcon={
                  isActionLoading(action.id) ? (
                    <CircularProgress size={16} color={action.color} />
                  ) : (
                    action.icon
                  )
                }
                onClick={() => handleAction(action)}
                disabled={disabled || isActionLoading(action.id) || (action.requiresAI && !isAIReady())}
                fullWidth
                sx={{ justifyContent: 'flex-start' }}
              >
                {action.label}
                {hasActionResult(action.id) && (
                  <Chip
                    label="✓"
                    size="small"
                    color="success"
                    sx={{ ml: 'auto', minWidth: 'auto', width: 20, height: 20 }}
                  />
                )}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Quick Stats */}
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            {Object.keys(results).length > 0 && (
              <>
                {Object.keys(results).length} action{Object.keys(results).length > 1 ? 's' : ''} completed
              </>
            )}
            {Object.keys(results).length === 0 && !currentReport && (
              'Select a report to enable AI actions'
            )}
            {Object.keys(results).length === 0 && !isAIReady() && (
              'AI embedding process in progress...'
            )}
            {Object.keys(results).length === 0 && isAIReady() && (
              'Click any action above to analyze your report'
            )}
          </Typography>
          
          {/* Embedding Status */}
          {embeddingStatus && (
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
              <Chip
                label={embeddingStatus.data?.embedding_status?.status === 'completed' ? 'AI Ready' : 'AI Processing'}
                size="small"
                color={embeddingStatus.data?.embedding_status?.status === 'completed' ? 'success' : 'warning'}
                variant="outlined"
              />
              {embeddingStatus.data?.embedding_status?.progress && (
                <Typography variant="caption" color="text.secondary">
                  %{embeddingStatus.data.embedding_status.progress}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </CardContent>

      {/* Expanded Action Results */}
      {actions.map((action) => (
        <Collapse key={action.id} in={expandedAction === action.id}>
          <Box sx={{ px: 2, pb: 2 }}>
            <ActionDisplay
              type={action.id === 'summary' ? 'summary' : 'actions'}
              data={results[action.id]}
              loading={loading[action.id]}
              error={expandedAction === action.id ? error : null}
            />
          </Box>
        </Collapse>
      ))}
    </Card>
  );
};

export default ActionBar;
