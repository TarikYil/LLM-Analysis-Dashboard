import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Paper,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Send,
  SmartToy,
  Person,
  Clear,
  Refresh,
  Info,
} from '@mui/icons-material';
import { reportAPI } from '../../services/api';
import { useDashboardStore, useReportsStore, useUIStore } from '../../store';

const ChatMessage = ({ message, isUser = false }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1,
        mb: 2,
        flexDirection: isUser ? 'row-reverse' : 'row',
      }}
    >
      <Avatar
        sx={{
          width: 32,
          height: 32,
          bgcolor: isUser ? 'primary.main' : 'secondary.main',
        }}
      >
        {isUser ? <Person /> : <SmartToy />}
      </Avatar>
      
      <Paper
        sx={{
          p: 1.5,
          maxWidth: '70%',
          backgroundColor: isUser ? 'primary.light' : 'background.paper',
          color: isUser ? 'primary.contrastText' : 'text.primary',
          borderRadius: 2,
          ...(isUser && {
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
          }),
        }}
      >
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {message.content}
        </Typography>
        
        {message.timestamp && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 0.5,
              opacity: 0.7,
            }}
          >
            {new Date(message.timestamp).toLocaleTimeString()}
          </Typography>
        )}
        
        {message.metadata && (
          <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {message.metadata.dataContextIncluded && (
              <Chip
                label="Data Context"
                size="small"
                color="success"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
            )}
            {message.metadata.aiEmbeddingReady && (
              <Chip
                label="AI Enhanced"
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
            )}
          </Box>
        )}
        
        {message.suggestions && message.suggestions.length > 0 && (
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {message.suggestions.map((suggestion, index) => (
              <Chip
                key={index}
                label={suggestion}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

const ChatBox = ({ reportId, height = 400, ...props }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  
  const { currentReport } = useReportsStore();
  const { 
    chatMessages, 
    isChatLoading, 
    addChatMessage, 
    setChatLoading, 
    setChatError,
    clearChatError 
  } = useDashboardStore();
  const { addNotification } = useUIStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      content: input.trim(),
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    addChatMessage(userMessage);
    setInput('');
    setChatLoading(true);
    setError(null);
    clearChatError();

    try {
      // Use new Gemini chat API
      const response = await reportAPI.chatWithGemini(input.trim(), true);
      
      const aiMessage = {
        id: Date.now() + 1,
        content: response.data?.response || response.response || 'I received your question but couldn\'t generate a response.',
        isUser: false,
        timestamp: new Date().toISOString(),
        suggestions: response.data?.suggestions || response.suggestions || [],
        metadata: {
          dataContextIncluded: response.data?.data_context_included || response.data_context_included,
          aiEmbeddingReady: response.data?.ai_embedding_ready || response.ai_embedding_ready
        }
      };

      addChatMessage(aiMessage);

    } catch (error) {
      console.error('Chat query error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      
      addChatMessage(errorMessage);
      setError(error.message);
      setChatError(error.message);
      
      addNotification({
        type: 'error',
        message: `Chat query failed: ${error.message}`,
      });
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    // This would need to be implemented in the store
    // For now, we'll just show a notification
    addNotification({
      type: 'info',
      message: 'Chat cleared',
    });
  };

  const refreshChat = () => {
    setError(null);
    clearChatError();
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', ...props.sx }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SmartToy color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              AI Assistant
            </Typography>
            <Tooltip 
              title="Ask questions about your data using natural language. AI analyzes your uploaded documents to provide intelligent responses."
              arrow
            >
              <Info sx={{ color: 'text.secondary', fontSize: 18 }} />
            </Tooltip>
          </Box>
        }
        subheader={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            {currentReport ? (
              <Chip
                label={currentReport.name}
                size="small"
                color="primary"
                variant="outlined"
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                AI Assistant - Ask questions about your data
              </Typography>
            )}
            <Chip
              label="Gemini AI"
              size="small"
              color="secondary"
              variant="filled"
              sx={{ fontSize: '0.7rem' }}
            />
          </Box>
        }
        action={
          <Box>
            <IconButton size="small" onClick={refreshChat} title="Refresh">
              <Refresh />
            </IconButton>
            <IconButton size="small" onClick={clearChat} title="Clear chat">
              <Clear />
            </IconButton>
          </Box>
        }
        sx={{ pb: 1 }}
      />

      <Divider />

      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
        {/* Messages Area */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
            minHeight: 0,
            maxHeight: height - 120, // Account for header and input
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          {chatMessages.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <SmartToy sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Start a conversation with Gemini AI
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ask questions about your data, reports, or get AI-powered insights
              </Typography>
              
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                {[
                  'What are the key insights in my data?',
                  'Show me the trends and patterns',
                  'What should I focus on?',
                  'Analyze the subscriber data',
                  'Give me actionable recommendations',
                ].map((suggestion) => (
                  <Chip
                    key={suggestion}
                    label={suggestion}
                    size="small"
                    variant="outlined"
                    onClick={() => setInput(suggestion)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {chatMessages.map((message) => (
            <ChatMessage key={message.id} message={message} isUser={message.isUser} />
          ))}

          {isChatLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                <SmartToy />
              </Avatar>
              <Paper sx={{ p: 1.5, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2" color="text.secondary">
                    AI is thinking...
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Input Area */}
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              placeholder={
                "Ask a question about your data or reports..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isChatLoading}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={!input.trim() || isChatLoading}
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                '&.Mui-disabled': {
                  bgcolor: 'action.disabledBackground',
                },
              }}
            >
              <Send />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ChatBox;
