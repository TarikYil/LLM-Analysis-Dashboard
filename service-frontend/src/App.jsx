import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Alert, Typography } from '@mui/material';

// Import theme
import theme from './styles/theme';

// Import components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

// Import pages
import Dashboard from './pages/Dashboard';
import Help from './pages/Help';

// Import stores
import { useUIStore } from './store';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6">An error occurred</Typography>
            <Typography variant="body2">
              A problem occurred while loading the page. Please refresh the page.
            </Typography>
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Error: {this.state.error?.message}
          </Typography>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Main Layout Component
const MainLayout = ({ children }) => {
  const { sidebarOpen } = useUIStore();
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Header */}
      <Header />
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          marginLeft: 0, // Remove all margins
          marginTop: 0, // Remove AppBar margin
          paddingTop: '64px', // Add padding instead for fixed header
        }}
      >
        {/* Page Content */}
        <Box sx={{ flexGrow: 1 }}>
          {children}
        </Box>
        
        {/* Footer */}
        <Footer />
      </Box>
    </Box>
  );
};

// App Component - No Authentication Required
const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
          {/* Main Dashboard Route */}
          <Route
            path="/"
            element={
              <MainLayout>
                <Dashboard />
              </MainLayout>
            }
          />
          
          {/* Help Page Route */}
          <Route
            path="/help"
            element={
              <MainLayout>
                <Help />
              </MainLayout>
            }
          />
          
          {/* Additional routes - All redirect to dashboard for now */}
          <Route path="/analytics" element={<Navigate to="/" replace />} />
          <Route path="/history" element={<Navigate to="/" replace />} />
          <Route path="/settings" element={<Navigate to="/" replace />} />
          
          {/* Catch-all redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
