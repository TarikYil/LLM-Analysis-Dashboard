import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle,
  AutoAwesome,
  Lightbulb,
  TrendingUp,
  Assessment,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Markdown benzeri formatlama
const formatActionText = (text) => {
  if (!text) return '';

  const lines = text.split('\n');

  return lines.map((line, lineIndex) => {
    let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    if (/^\d+\.\s*\*\*.*?\*\*:/.test(line)) {
      formattedLine = formattedLine.replace(
        /^(\d+\.\s*)(\*\*.*?\*\*):/,
        '$1<strong>$2</strong>:'
      );
    }

    if (/^\*\s*\*\*.*?\*\*:/.test(line)) {
      formattedLine = formattedLine.replace(
        /^(\*\s*)(\*\*.*?\*\*):/,
        '$1<strong>$2</strong>:'
      );
    }

    return (
      <Box key={lineIndex} sx={{ mb: lineIndex < lines.length - 1 ? 1 : 0 }}>
        <Typography
          component="span"
          variant="body2"
          sx={{
            lineHeight: 1.6,
            '& strong': {
              fontWeight: 'bold',
              color: 'primary.main',
            },
          }}
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      </Box>
    );
  });
};

const ActionDisplay = ({
  type = 'actions', // 'actions' or 'summary'
  data = null,
  loading = false,
  error = null,
  ...props
}) => {
  const theme = useTheme();

  console.log('🔍 [ActionDisplay] Component rendered with:', {
    type,
    hasData: !!data,
    dataType: typeof data,
    dataKeys: data ? Object.keys(data) : 'no data',
    loading,
    error
  });

  if (loading) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {type === 'actions'
              ? 'Loading action items...'
              : 'Preparing summary...'}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Alert severity="info">
            {type === 'actions'
              ? 'Please run analysis first to view action items.'
              : 'Please run analysis first to view summary.'}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // -------- Actions ----------
  const renderActions = () => {
    console.log('📊 ActionDisplay renderActions called with data:', data);
    console.log('📊 ActionDisplay renderActions - data.actions:', data.actions);
    console.log('📊 ActionDisplay renderActions - data.actions type:', typeof data.actions);
    console.log('📊 ActionDisplay renderActions - data.actions keys:', Object.keys(data.actions || {}));
    
    if (!data.actions) {
      console.log('❌ ActionDisplay renderActions - No actions data found');
      return null;
    }

    const { basic_actions, ai_actions, ai_enabled } = data.actions;
    console.log('📊 ActionDisplay renderActions - basic_actions:', basic_actions);
    console.log('📊 ActionDisplay renderActions - ai_actions:', ai_actions);
    console.log('📊 ActionDisplay renderActions - ai_enabled:', ai_enabled);
    console.log('📊 ActionDisplay renderActions - basic_actions length:', basic_actions?.length);
    console.log('📊 ActionDisplay renderActions - ai_actions length:', ai_actions?.length);

    return (
      <Box>
        {/* Basic Actions */}
        {basic_actions && basic_actions.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Assessment sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Basic Recommendations
              </Typography>
              <Chip
                label={`${basic_actions.length} recommendations`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ ml: 2 }}
              />
            </Box>

            <List sx={{ pl: 0 }}>
              {basic_actions.map((action, index) => {
                console.log(`📊 ActionDisplay renderActions - basic_actions[${index}]:`, action);
                return (
                  <ListItem key={index} sx={{ px: 0, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={action}
                      primaryTypographyProps={{
                        variant: 'body2',
                        sx: { lineHeight: 1.6 },
                      }}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}

        {/* AI Actions */}
        {ai_actions && ai_actions.length > 0 && (
          <Box>
            {basic_actions && basic_actions.length > 0 && (
              <Divider sx={{ my: 3 }} />
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AutoAwesome sx={{ mr: 1, color: 'warning.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                AI Recommendations
              </Typography>
              <Chip
                label={`${ai_actions.length} recommendations`}
                size="small"
                color="warning"
                variant="outlined"
                sx={{ ml: 2 }}
              />
              {ai_enabled && (
                <Chip
                  label="AI Active"
                  size="small"
                  color="success"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>

            <List sx={{ pl: 0 }}>
              {ai_actions.map((action, index) => {
                console.log(`📊 ActionDisplay renderActions - ai_actions[${index}]:`, action);
                return (
                  <ListItem key={index} sx={{ px: 0, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Lightbulb
                        sx={{ color: 'warning.main', fontSize: 20 }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            lineHeight: 1.6,
                            whiteSpace: 'pre-line',
                            '& strong': {
                              fontWeight: 'bold',
                              color: 'primary.main',
                            },
                          }}
                        >
                          {formatActionText(action)}
                        </Box>
                      }
                      primaryTypographyProps={{
                        variant: 'body2',
                        component: 'div',
                      }}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}
      </Box>
    );
  };

  // -------- Summary ----------
  const renderSummary = () => {
    console.log('📊 Summary renderSummary called');
    console.log('📊 Summary renderSummary - data:', data);
    console.log('📊 Summary renderSummary - data type:', typeof data);
    console.log('📊 Summary renderSummary - data keys:', Object.keys(data || {}));
    console.log('📊 Summary renderSummary - data.data:', data?.data);
    console.log('📊 Summary renderSummary - data.summary:', data?.summary);
    
    if (!data) {
      console.log('📊 Summary renderSummary - No data, returning null');
      return null;
    }

    // ActionBar'dan gelen data zaten summaryData formatında
    const summaryData = data;
    console.log('📊 Summary renderSummary - summaryData:', summaryData);
    console.log('📊 Summary renderSummary - summaryData type:', typeof summaryData);
    console.log('📊 Summary renderSummary - summaryData keys:', Object.keys(summaryData || {}));

    console.log('🔍 [ActionDisplay] summaryData structure:', {
      isObject: typeof summaryData === 'object',
      isArray: Array.isArray(summaryData),
      hasSummary: 'summary' in summaryData,
      hasData: 'data' in summaryData,
      hasResult: 'result' in summaryData,
      hasResponse: 'response' in summaryData,
      keys: Object.keys(summaryData),
      summaryType: typeof summaryData.summary,
      summaryValue: summaryData.summary ? summaryData.summary.substring(0, 100) + '...' : summaryData.summary
    });

    // summaryData yok veya summary yoksa
    if (!summaryData || typeof summaryData !== 'object' || !summaryData.summary) {
      console.log('❌ [ActionDisplay] No summary found in data structure');
      console.log('❌ [ActionDisplay] Available fields:', Object.keys(summaryData || {}));
      
      // Try to find summary in different possible locations
      if (summaryData?.ai_summary) {
        console.log('🔍 [ActionDisplay] Found summary in ai_summary');
        summaryData.summary = summaryData.ai_summary;
      } else if (summaryData?.basic_summary?.ozet) {
        console.log('🔍 [ActionDisplay] Found summary in basic_summary.ozet');
        summaryData.summary = summaryData.basic_summary.ozet;
      } else if (summaryData?.data?.summary) {
        console.log('🔍 [ActionDisplay] Found summary in data.summary');
        summaryData.summary = summaryData.data.summary;
      } else if (summaryData?.result?.summary) {
        console.log('🔍 [ActionDisplay] Found summary in result.summary');
        summaryData.summary = summaryData.result.summary;
      } else if (summaryData?.response?.summary) {
        console.log('🔍 [ActionDisplay] Found summary in response.summary');
        summaryData.summary = summaryData.response.summary;
      } else {
        console.log('❌ [ActionDisplay] Summary not found in any structure');
        console.log('❌ [ActionDisplay] Available fields:', Object.keys(summaryData || {}));
        return (
          <Alert severity="warning">
            Summary data not found. No summary field in API response.
            <br />
            Available fields: {Object.keys(summaryData || {}).join(', ')}
          </Alert>
        );
      }
    }

    // Destructure
    const {
      summary,
      generatedAt,
      wordCount,
      confidence,
      ai_enabled
    } = summaryData;
    
    // Get ai_enabled from the main object if not in summaryData
    const finalAiEnabled = ai_enabled || summaryData.ai_enabled;

    console.log('🔍 [ActionDisplay] Summary extracted details:', {
      summaryType: typeof summary,
      summaryLength: summary ? summary.length : 0,
      summaryPreview: typeof summary === 'string' ? summary.substring(0, 200) + '...' : summary,
      hasSummary: !!summary,
      generatedAt,
      wordCount,
      confidence,
      ai_enabled,
      allFields: Object.keys(summaryData)
    });

    // Eğer summary string değilse, hata ver
    if (typeof summary !== 'string') {
      console.error('❌ [ActionDisplay] Summary is not a string:', { 
        summary, 
        type: typeof summary,
        summaryData: summaryData,
        availableFields: Object.keys(summaryData)
      });
      return (
        <Alert severity="error">
          Summary data is not in string format. Type: {typeof summary}
          <br />
          Available fields: {Object.keys(summaryData).join(', ')}
        </Alert>
      );
    }

    // Backend'den gelen formatlanmış HTML'i direkt kullan
    let formattedSummary = summary;
    
    // Metin içinde ':' varsa madde halinde düzenle ve ### başlıklarını kalınlaştır
    if (typeof formattedSummary === 'string') {
      // Satırları ayır
      const lines = formattedSummary.split('\n');
      const processedLines = lines.map(line => {
        let processedLine = line;
        
        // ### ile başlayan satırları kalınlaştır (:'a kadar)
        if (line.trim().startsWith('###')) {
          const colonIndex = line.indexOf(':');
          if (colonIndex !== -1) {
            const beforeColon = line.substring(0, colonIndex + 1);
            const afterColon = line.substring(colonIndex + 1);
            processedLine = `**${beforeColon}**${afterColon}`;
          }
        }
        
        // Satırda ':' varsa ve madde işareti yoksa madde işareti ekle
        if (processedLine.includes(':') && !processedLine.trim().startsWith('*') && !processedLine.trim().startsWith('-') && !processedLine.trim().startsWith('•')) {
          // Satırın başındaki boşlukları koru
          const leadingSpaces = processedLine.match(/^\s*/)[0];
          const content = processedLine.trim();
          return `${leadingSpaces}• ${content}`;
        }
        
        return processedLine;
      });
      formattedSummary = processedLines.join('\n');
      
      // Markdown'ı HTML'e çevir
      formattedSummary = formattedSummary
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/### (.*?):/g, '<h3><strong>$1:</strong></h3>')
        .replace(/## (.*?):/g, '<h2><strong>$1:</strong></h2>')
        .replace(/# (.*?):/g, '<h1><strong>$1:</strong></h1>')
        .replace(/---/g, '<hr>')
        .replace(/\n/g, '<br>');
    }

    console.log('🔍 [ActionDisplay] Formatted summary processing:', {
      summaryType: typeof summary,
      summaryLength: summary ? summary.length : 0,
      formattedSummaryPreview: formattedSummary?.substring(0, 300) + '...',
      isHTML: summary ? summary.includes('<') : false,
      hasHTMLTags: summary ? /<[^>]*>/g.test(summary) : false
    });

    return (
      <Box>
        {/* Summary Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TrendingUp sx={{ mr: 1, color: 'info.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Report Summary
          </Typography>
          {finalAiEnabled && (
            <Chip
              label="AI Summary"
              size="small"
              color="info"
              sx={{ ml: 2 }}
            />
          )}
        </Box>

        {/* Summary Content */}
        <Box sx={{ mb: 3 }}>
          <Card sx={{ bgcolor: 'background.default', p: 3 }}>
            {formattedSummary && typeof formattedSummary === 'string' ? (
              <Box sx={{ 
                '& h1, & h2, & h3, & h4, & h5, & h6': {
                  color: 'primary.main',
                  fontWeight: 'bold',
                  mb: 2,
                  mt: 3
                },
                '& h1': { fontSize: '1.5rem' },
                '& h2': { fontSize: '1.3rem' },
                '& h3': { fontSize: '1.2rem' },
                '& p': {
                  mb: 2,
                  lineHeight: 1.7,
                  fontSize: '1rem'
                },
                '& ul, & ol': {
                  pl: 3,
                  mb: 2
                },
                '& li': {
                  mb: 1,
                  lineHeight: 1.6
                },
                '& strong': {
                  fontWeight: 'bold',
                  color: 'primary.main'
                },
                '& em': {
                  fontStyle: 'italic',
                  color: 'text.secondary'
                },
                '& hr': {
                  border: 'none',
                  borderTop: '2px solid',
                  borderColor: 'divider',
                  my: 3
                }
              }}>
                <div
                  style={{
                    lineHeight: 1.8,
                    fontSize: '1rem',
                    fontFamily: 'inherit'
                  }}
                  dangerouslySetInnerHTML={{ __html: formattedSummary }}
                />
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Summary data could not be formatted
                <br />
                Type: {typeof formattedSummary}
                <br />
                Value: {JSON.stringify(formattedSummary)}
              </Typography>
            )}
          </Card>
        </Box>

        {/* Summary Stats */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {wordCount && (
            <Chip label={`${wordCount} words`} size="small" variant="outlined" />
          )}
          {confidence && (
            <Chip
              label={`%${(confidence * 100).toFixed(0)} confidence`}
              size="small"
              variant="outlined"
              color="success"
            />
          )}
          {generatedAt && (
            <Chip
              label={`${new Date(generatedAt).toLocaleString('en-US')}`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Card sx={{ mt: 2, border: 1, borderColor: 'divider' }} {...props}>
      <CardContent>
        {type === 'actions' ? renderActions() : renderSummary()}
      </CardContent>
    </Card>
  );
};

export default ActionDisplay;
