import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Breadcrumbs,
  Link,
  Fade,
} from '@mui/material';
import {
  Home,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Import components
import KpiCards from '../components/cards/KpiCards';
import TrendChart from '../components/charts/TrendChart';
import BoxPlotChart from '../components/charts/BoxPlotChart';
import UploadArea from '../components/forms/UploadArea';
import ActionBar from '../components/widgets/ActionBar';
import ChatBox from '../components/widgets/ChatBox';

// Import stores
import { useReportsStore, useDashboardStore, useAppStore } from '../store';

const Dashboard = () => {
  const theme = useTheme();
  const { isLoading: appLoading } = useAppStore();
  const { reports, currentReport } = useReportsStore();
  const { kpis, trends, summary, isLoading } = useDashboardStore();
  
  console.log('📊 Dashboard - summary from store:', summary);
  console.log('📊 Dashboard - summary type:', typeof summary);
  console.log('📊 Dashboard - summary keys:', Object.keys(summary || {}));
  console.log('📊 Dashboard - summary.summary:', summary?.summary);
  console.log('📊 Dashboard - summary.summary type:', typeof summary?.summary);

  // Sample trend data for the chart
  const sampleTrendData = [
    { date: 'Jan', revenue: 4000, users: 240, conversion: 2.4 },
    { date: 'Feb', revenue: 3000, users: 139, conversion: 1.8 },
    { date: 'Mar', revenue: 5000, users: 380, conversion: 3.1 },
    { date: 'Apr', revenue: 4500, users: 320, conversion: 2.8 },
    { date: 'May', revenue: 6000, users: 450, conversion: 3.5 },
    { date: 'Jun', revenue: 5500, users: 420, conversion: 3.2 },
  ];

  const handleUploadComplete = (uploadResult) => {
    console.log('Upload completed:', uploadResult);
    // The upload component will handle adding to the store
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ pt: 1, pb: 4 }}>
        <Grid container spacing={3}>
          {/* KPI Cards Row - Full Width */}
          <Grid item xs={12}>
            <Fade in timeout={300}>
              <div>
                <KpiCards kpiData={kpis} />
              </div>
            </Fade>
          </Grid>

          {/* Get Started Section */}
          <Grid item xs={12}>
            <Fade in timeout={400}>
              <Paper 
                sx={{ 
                  p: 4, 
                  textAlign: 'center', 
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  border: '2px dashed',
                  borderColor: 'primary.light',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: 2,
                  }
                }}
              >
                <DashboardIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Get Started with AI Reporting
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2, maxWidth: 600, mx: 'auto' }}>
                  Upload your first report to unlock powerful AI-driven insights, trend analysis, 
                  and actionable recommendations.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supported formats: PDF, CSV, Excel files up to 50MB
                </Typography>
              </Paper>
            </Fade>
          </Grid>

          {/* Charts Row */}
          <Grid item xs={12} md={8}>
            <Fade in timeout={600}>
              <Grid container spacing={3} sx={{ height: 'fit-content' }}>
                {/* Subscriber Trend Chart */}
                <Grid item xs={12} lg={6}>
                  <TrendChart
                    title="Subscriber Registration Trend"
                    data={trends}
                    dataKey="value"
                    type="area"
                    color={theme.palette.success.main}
                    subtitle="Subscriber registrations over time"
                    height={300}
                  />
                </Grid>

                {/* District Distribution Box Plot */}
                <Grid item xs={12} lg={6}>
                  <BoxPlotChart
                    title="District Distribution"
                    data={kpis}
                    height={300}
                    subtitle="Districts with highest subscriber registrations"
                    showStats={true}
                  />
                </Grid>

                {/* AI Actions Bar */}
                <Grid item xs={12} sx={{ mt: 1 }}>
                  <ActionBar reportId={currentReport?.id} />
                </Grid>
              </Grid>
            </Fade>
          </Grid>

          {/* Right Sidebar */}
          <Grid item xs={12} md={4}>
            <Fade in timeout={900}>
              <Grid container spacing={3} sx={{ height: '100%' }}>
                {/* Upload Area */}
                <Grid item xs={12} sx={{ height: 'auto' }}>
                  <Paper sx={{ p: 0, borderRadius: 2, height: 'fit-content' }}>
                    <UploadArea onUploadComplete={handleUploadComplete} />
                  </Paper>
                </Grid>

                {/* AI Assistant Chat Box */}
                <Grid item xs={12} sx={{ flexGrow: 1, display: 'flex' }}>
                  <ChatBox 
                    reportId={currentReport?.id}
                    height={420}
                    sx={{ width: '100%', height: '100%' }}
                  />
                </Grid>
              </Grid>
            </Fade>
          </Grid>


          {/* Recent Reports Section */}
          {reports.length > 0 && (
            <Grid item xs={12}>
              <Fade in timeout={1500}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Recent Reports
                  </Typography>
                  <Grid container spacing={2}>
                    {reports.slice(0, 4).map((report, index) => (
                      <Grid item xs={12} sm={6} md={3} key={report.id || index}>
                        <Paper
                          sx={{
                            p: 2,
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              boxShadow: 4,
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          <Typography variant="subtitle2" noWrap>
                            {report.name || `Report ${index + 1}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {report.type || 'PDF'} • {report.date || '2 days ago'}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Fade>
            </Grid>
          )}

        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
