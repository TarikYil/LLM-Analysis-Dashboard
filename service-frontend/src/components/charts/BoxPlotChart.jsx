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
} from '@mui/material';
import {
  MoreVert,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useTheme } from '@mui/material/styles';

const BoxPlotChart = ({ 
  title = "District Distribution",
  data = null,
  height = 400,
  showStats = true,
  color,
  subtitle,
  ...props 
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);
  
  // Use theme colors if no color provided
  const chartColor = color || theme.palette.primary.main;
  
  // Process district distribution from KPI data
  const processCountyData = (kpiData) => {
    if (!kpiData || !kpiData.kpi || !kpiData.kpi.county_distribution) return [];
    
    const { county_distribution } = kpiData.kpi;
    
    // Sort districts by subscriber count and take top 15
    return Object.entries(county_distribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([county, count], index) => ({
        county: county,
        abone: count,
        formattedAbone: count.toLocaleString('en-US'),
        rank: index + 1,
        percentage: ((count / kpiData.kpi.total_subscribers) * 100).toFixed(1)
      }));
  };
  
  // Sample data if none provided
  const sampleData = [
    { county: 'FATIH', abone: 49239, formattedAbone: '49,239', rank: 1, percentage: '18.7' },
    { county: 'BEYOGLU', abone: 23086, formattedAbone: '23,086', rank: 2, percentage: '8.8' },
    { county: 'MALTEPE', abone: 21954, formattedAbone: '21,954', rank: 3, percentage: '8.3' },
    { county: 'KUCUKCEKMECE', abone: 14526, formattedAbone: '14,526', rank: 4, percentage: '5.5' },
    { county: 'BAKIRKOY', abone: 12050, formattedAbone: '12,050', rank: 5, percentage: '4.6' },
    { county: 'ESENLER', abone: 9251, formattedAbone: '9,251', rank: 6, percentage: '3.5' },
    { county: 'SANCAKTEPE', abone: 9673, formattedAbone: '9,673', rank: 7, percentage: '3.7' },
    { county: 'ZEYTINBURNU', abone: 9002, formattedAbone: '9,002', rank: 8, percentage: '3.4' },
    { county: 'USKUDAR', abone: 8758, formattedAbone: '8,758', rank: 9, percentage: '3.3' },
    { county: 'KADIKOY', abone: 8136, formattedAbone: '8,136', rank: 10, percentage: '3.1' },
  ];
  
  const chartData = data ? processCountyData(data) : sampleData;

  // Calculate statistics
  const calculateStats = () => {
    if (chartData.length === 0) return null;
    
    const values = chartData.map(item => item.abone);
    const total = values.reduce((sum, val) => sum + val, 0);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const avg = total / values.length;
    
    // Highest district
    const topCounty = chartData[0];
    
    return {
      total,
      max,
      min,
      avg: Math.round(avg),
      topCounty,
      totalCounties: chartData.length
    };
  };

  const stats = calculateStats();

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Color palette
  const getBarColor = (index) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      theme.palette.info.main,
    ];
    return colors[index % colors.length];
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box sx={{ 
          bgcolor: 'background.paper', 
          p: 2, 
          borderRadius: 1, 
          boxShadow: 2,
          border: 1,
          borderColor: 'divider'
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            {data.county}
          </Typography>
          <Typography variant="body2" color="primary">
            Subscriber Count: {data.formattedAbone}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Rank: #{data.rank}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ratio: %{data.percentage}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} {...props}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" component="div">
              {title}
            </Typography>
            {stats && (
              <Chip
                label={`${stats.totalCounties} Districts`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        }
        subheader={subtitle}
        action={
          <IconButton
            aria-label="more"
            aria-controls="boxplot-menu"
            aria-haspopup="true"
            onClick={handleMenuClick}
          >
            <MoreVert />
          </IconButton>
        }
        sx={{ pb: 1 }}
      />
      
      <Menu
        id="boxplot-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>View Details</MenuItem>
        <MenuItem onClick={handleMenuClose}>Export Data</MenuItem>
        <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
      </Menu>

      <CardContent sx={{ flexGrow: 1, pt: 0 }}>
        {/* Statistics */}
        {showStats && stats && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                  {stats.topCounty.formattedAbone}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Highest ({stats.topCounty.county})
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold' }}>
                  {stats.avg.toLocaleString('en-US')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Average
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="warning.main" sx={{ fontWeight: 'bold' }}>
                  {stats.min.toLocaleString('en-US')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Lowest
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* Chart */}
        <Box sx={{ height: height, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis 
                dataKey="county" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
                stroke={theme.palette.text.secondary}
              />
              <YAxis 
                stroke={theme.palette.text.secondary}
                tickFormatter={(value) => value.toLocaleString('en-US')}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="abone" 
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Bottom info */}
        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
            Districts are sorted by subscriber count. Top {chartData.length} districts are shown.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BoxPlotChart;
