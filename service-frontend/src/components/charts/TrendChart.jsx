import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  MoreVert,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Info,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { useTheme } from '@mui/material/styles';

const TrendChart = ({ 
  title = "Trend Analysis",
  data = null,
  dataKey = "value",
  xAxisKey = "date",
  type = "line", // "line" or "area"
  height = 300,
  showTrend = true,
  color,
  subtitle,
  ...props 
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);
  
  // Use theme colors if no color provided
  const chartColor = color || theme.palette.primary.main;
  
  // Yeni API formatından trend verisini işle
  const processTrendData = (trendData) => {
    if (!trendData || !trendData.trend) return [];
    
    return Object.entries(trendData.trend)
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
      .map(([date, value]) => ({
        date: new Date(date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        fullDate: date,
        value: value,
        formattedValue: value.toLocaleString('en-US')
      }));
  };
  
  // Sample data if none provided
  const sampleData = [
    { date: 'Nov 5', value: 1, fullDate: '2015-11-05' },
    { date: 'Nov 11', value: 1, fullDate: '2015-11-11' },
    { date: 'Nov 14', value: 2, fullDate: '2015-11-14' },
    { date: 'Nov 15', value: 2, fullDate: '2015-11-15' },
    { date: 'Nov 22', value: 15, fullDate: '2015-11-22' },
    { date: 'May 19', value: 125, fullDate: '2021-05-19' },
  ];
  
  const chartData = data ? processTrendData(data) : sampleData;

  // Calculate trend
  const calculateTrend = () => {
    if (chartData.length < 2) return { direction: 'flat', percentage: 0 };
    
    const firstValue = chartData[0][dataKey];
    const lastValue = chartData[chartData.length - 1][dataKey];
    const percentage = ((lastValue - firstValue) / firstValue) * 100;
    
    if (percentage > 5) return { direction: 'up', percentage };
    if (percentage < -5) return { direction: 'down', percentage };
    return { direction: 'flat', percentage };
  };

  const trend = calculateTrend();

  const getTrendIcon = () => {
    switch (trend.direction) {
      case 'up':
        return <TrendingUp sx={{ color: 'success.main' }} />;
      case 'down':
        return <TrendingDown sx={{ color: 'error.main' }} />;
      default:
        return <TrendingFlat sx={{ color: 'warning.main' }} />;
    }
  };

  const getTrendColor = () => {
    switch (trend.direction) {
      case 'up':
        return 'success';
      case 'down':
        return 'error';
      default:
        return 'warning';
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 1.5,
            boxShadow: 2,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {label}
          </Typography>
          <Typography variant="body2" color="primary.main">
            {`${dataKey}: ${payload[0].value.toLocaleString()}`}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ height: '100%', ...props.sx }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            <Tooltip 
              title="Interactive chart showing data trends over time with AI-powered insights and analysis."
              arrow
            >
              <Info sx={{ color: 'text.secondary', fontSize: 18 }} />
            </Tooltip>
            {showTrend && (
              <Chip
                icon={getTrendIcon()}
                label={`${Math.abs(trend.percentage).toFixed(1)}%`}
                size="small"
                color={getTrendColor()}
                variant="outlined"
              />
            )}
          </Box>
        }
        subheader={subtitle}
        action={
          <IconButton onClick={handleMenuOpen}>
            <MoreVert />
          </IconButton>
        }
        sx={{ pb: 0 }}
      />
      
      <CardContent sx={{ pt: 1 }}>
        <Box sx={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            {type === 'area' ? (
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={theme.palette.divider}
                  opacity={0.5}
                />
                <XAxis 
                  dataKey={xAxisKey}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey={dataKey}
                  stroke={chartColor}
                  strokeWidth={2}
                  fill="url(#colorGradient)"
                />
              </AreaChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={theme.palette.divider}
                  opacity={0.5}
                />
                <XAxis 
                  dataKey={xAxisKey}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey={dataKey}
                  stroke={chartColor}
                  strokeWidth={2}
                  dot={{ fill: chartColor, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: chartColor, strokeWidth: 2 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </Box>
      </CardContent>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleMenuClose}>Export Data</MenuItem>
        <MenuItem onClick={handleMenuClose}>View Details</MenuItem>
        <MenuItem onClick={handleMenuClose}>Configure</MenuItem>
      </Menu>
    </Card>
  );
};

export default TrendChart;
