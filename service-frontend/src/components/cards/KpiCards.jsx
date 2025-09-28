import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  MoreVert,
  Assessment,
  MonetizationOn,
  People,
  Timeline,
  Info,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const KpiCard = ({ 
  title, 
  value, 
  unit = '', 
  trend, 
  trendValue, 
  icon, 
  color = 'primary',
  progress,
  subtitle,
  ...props 
}) => {
  const theme = useTheme();
  
  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend) {
      case 'up':
        return <TrendingUp sx={{ color: 'success.main', fontSize: 16 }} />;
      case 'down':
        return <TrendingDown sx={{ color: 'error.main', fontSize: 16 }} />;
      default:
        return <TrendingFlat sx={{ color: 'warning.main', fontSize: 16 }} />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'success';
      case 'down':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        position: 'relative',
        '&:hover': {
          boxShadow: 4,
        },
        ...props.sx 
      }}
    >
      <CardContent sx={{ pb: '16px !important' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {icon && (
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  backgroundColor: `${color}.light`,
                  color: `${color}.contrastText`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {icon}
              </Box>
            )}
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="caption" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
          
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>

        {/* Main Value */}
        <Box sx={{ mb: 2 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              color: 'text.primary',
              lineHeight: 1,
            }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
            {unit && (
              <Typography 
                component="span" 
                variant="h6" 
                sx={{ color: 'text.secondary', ml: 0.5 }}
              >
                {unit}
              </Typography>
            )}
          </Typography>
        </Box>

        {/* Progress Bar */}
        {progress !== undefined && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 6,
                borderRadius: 3,
                backgroundColor: 'action.hover',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: `${color}.main`,
                  borderRadius: 3,
                },
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {progress}% of target
            </Typography>
          </Box>
        )}

        {/* Trend */}
        {trend && trendValue && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip
              icon={getTrendIcon()}
              label={`${Math.abs(trendValue)}%`}
              size="small"
              color={getTrendColor()}
              variant="outlined"
              sx={{ height: 24 }}
            />
            <Typography variant="caption" color="text.secondary">
              vs last period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const KpiCards = ({ kpiData = null, ...props }) => {
  // Yeni API formatından KPI'ları işle
  const processKpiData = (data) => {
    if (!data || !data.kpi) return [];
    
    const { kpi } = data;
    const processedKpis = [];
    
    // Total subscriber count
    if (kpi.total_subscribers) {
      processedKpis.push({
        id: 'total_subscribers',
        title: 'Total Subscribers',
        value: kpi.total_subscribers.toLocaleString('en-US'),
        trend: 'up',
        trendValue: 0,
        icon: <People />,
        color: 'primary',
        subtitle: 'Total registered subscribers',
      });
    }
    
    // Highest district
    if (kpi.county_distribution) {
      const topCounty = Object.entries(kpi.county_distribution)
        .sort(([,a], [,b]) => b - a)[0];
      
      if (topCounty) {
        processedKpis.push({
          id: 'top_county',
          title: 'Highest District',
          value: topCounty[0],
          subtitle: `${topCounty[1].toLocaleString('en-US')} subscribers`,
          trend: 'up',
          trendValue: 0,
          icon: <Assessment />,
          color: 'success',
        });
      }
    }
    
    // Domestic subscriber ratio
    if (kpi.domestic_foreign_distribution && kpi.total_subscribers) {
      const domesticCount = kpi.domestic_foreign_distribution['Yerli'] || 0;
      const domesticPercentage = ((domesticCount / kpi.total_subscribers) * 100).toFixed(1);
      
      processedKpis.push({
        id: 'domestic_ratio',
        title: 'Domestic Subscriber Ratio',
        value: `%${domesticPercentage}`,
        subtitle: `${domesticCount.toLocaleString('en-US')} domestic subscribers`,
        trend: 'up',
        trendValue: 0,
        icon: <MonetizationOn />,
        color: 'info',
      });
    }
    
    // Foreign subscriber ratio
    if (kpi.domestic_foreign_distribution && kpi.total_subscribers) {
      const foreignCount = kpi.domestic_foreign_distribution['Yabancı'] || 0;
      const foreignPercentage = ((foreignCount / kpi.total_subscribers) * 100).toFixed(1);
      
      processedKpis.push({
        id: 'foreign_ratio',
        title: 'Foreign Subscriber Ratio',
        value: `%${foreignPercentage}`,
        subtitle: `${foreignCount.toLocaleString('en-US')} foreign subscribers`,
        trend: 'up',
        trendValue: 0,
        icon: <Timeline />,
        color: 'warning',
      });
    }
    
    return processedKpis;
  };

  // Sample KPI data if none provided
  const sampleKpis = [
    {
      id: 1,
      title: 'Total Subscribers',
      value: '263,264',
      trend: 'up',
      trendValue: 12.5,
      icon: <People />,
      color: 'primary',
      subtitle: 'Total registered subscribers',
    },
    {
      id: 2,
      title: 'Highest District',
      value: 'FATIH',
      subtitle: '49,239 subscribers',
      trend: 'up',
      trendValue: 8.2,
      icon: <Assessment />,
      color: 'success',
    },
    {
      id: 3,
      title: 'Domestic Subscriber Ratio',
      value: '%79.2',
      subtitle: '208,508 domestic subscribers',
      trend: 'up',
      trendValue: 2.1,
      icon: <MonetizationOn />,
      color: 'info',
    },
    {
      id: 4,
      title: 'Foreign Subscriber Ratio',
      value: '%20.8',
      subtitle: '54,712 foreign subscribers',
      trend: 'up',
      trendValue: 5.3,
      icon: <Timeline />,
      color: 'warning',
    },
  ];

  const displayKpis = kpiData ? processKpiData(kpiData) : sampleKpis;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Key Performance Indicators
        </Typography>
        <Tooltip 
          title="AI-extracted metrics from your documents showing key insights, trends, and performance indicators."
          arrow
        >
          <Info sx={{ color: 'text.secondary', fontSize: 20 }} />
        </Tooltip>
      </Box>
      <Grid container spacing={3} {...props}>
        {displayKpis.slice(0, 4).map((kpi, index) => (
        <Grid item xs={12} sm={6} md={3} key={kpi.id || index}>
          <KpiCard 
            title={kpi.name || kpi.title}
            value={kpi.value}
            trend={kpi.trend}
            trendValue={kpi.change}
            subtitle={kpi.description || kpi.subtitle}
            icon={kpi.icon}
          />
        </Grid>
      ))}
      </Grid>
    </Box>
  );
};

export default KpiCards;
