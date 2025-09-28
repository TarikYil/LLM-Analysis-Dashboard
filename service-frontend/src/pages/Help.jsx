import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Button,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  ExpandMore,
  Architecture,
  Storage,
  Psychology,
  Code,
  Cloud,
  Security,
  Speed,
  DataUsage,
  SmartToy,
  Api,
  Web,
  Storage as StorageIcon,
  Psychology as PsychologyIcon,
  Code as CodeIcon,
  Cloud as CloudIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  DataUsage as DataUsageIcon,
  SmartToy as SmartToyIcon,
  Api as ApiIcon,
  Web as WebIcon,
  Home,
  Help as HelpIcon,
} from '@mui/icons-material';

const Help = () => {
  const [expanded, setExpanded] = useState('overview');

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const systemArchitecture = {
    frontend: {
      name: 'Frontend Service',
      technology: 'React 18 + Vite',
      description: 'Modern React application with Material-UI components',
      features: [
        'Responsive dashboard interface',
        'Real-time data visualization',
        'Interactive charts and graphs',
        'File upload with drag & drop',
        'AI chat interface',
        'Settings management',
        'Notification system'
      ],
      stack: ['React 18', 'Material-UI', 'Recharts', 'Axios', 'Zustand', 'React Router']
    },
    backend: {
      name: 'Backend Service',
      technology: 'Node.js + Express',
      description: 'RESTful API server handling business logic and data processing',
      features: [
        'File upload and processing',
        'API endpoints for all services',
        'Notification management',
        'Settings persistence',
        'Error handling middleware',
        'CORS and security headers'
      ],
      stack: ['Node.js', 'Express.js', 'Multer', 'CORS', 'Express Validator']
    },
    ai: {
      name: 'AI Service',
      technology: 'Python + FastAPI',
      description: 'AI-powered analysis engine using Google Gemini and advanced NLP',
      features: [
        'Document analysis and parsing',
        'Natural language processing',
        'KPI extraction and calculation',
        'Trend analysis and insights',
        'Action item generation',
        'Chat-based AI interactions',
        'Embedding and vector search'
      ],
      stack: ['Python 3.10', 'FastAPI', 'Google Gemini', 'Pandas', 'NumPy', 'Scikit-learn', 'Sentence Transformers']
    }
  };

  const aiAnalysisFlow = [
    {
      step: 1,
      title: 'Document Upload',
      description: 'Users upload PDF, CSV, or Excel files through the web interface',
      technology: 'React + Multer'
    },
    {
      step: 2,
      title: 'File Processing',
      description: 'Backend validates and stores the uploaded file',
      technology: 'Node.js + Express'
    },
    {
      step: 3,
      title: 'AI Analysis',
      description: 'Python service processes the document using AI models',
      technology: 'FastAPI + Gemini'
    },
    {
      step: 4,
      title: 'Data Extraction',
      description: 'AI extracts key metrics, trends, and insights from the document',
      technology: 'NLP + Machine Learning'
    },
    {
      step: 5,
      title: 'Chunk Processing',
      description: 'Document is split into chunks for better analysis and embedding',
      technology: 'Text Chunking + Vector Embeddings'
    },
    {
      step: 6,
      title: 'Results Generation',
      description: 'AI generates summaries, KPIs, trends, and actionable insights',
      technology: 'Gemini Pro + Custom Prompts'
    },
    {
      step: 7,
      title: 'Data Visualization',
      description: 'Frontend displays results in interactive charts and dashboards',
      technology: 'React + Recharts'
    }
  ];

  const technologies = {
    frontend: [
      { name: 'React 18', category: 'Framework', description: 'Modern UI library with hooks and concurrent features' },
      { name: 'Material-UI', category: 'UI Library', description: 'Google Material Design components' },
      { name: 'Recharts', category: 'Charts', description: 'Composable charting library for React' },
      { name: 'Zustand', category: 'State Management', description: 'Lightweight state management solution' },
      { name: 'Axios', category: 'HTTP Client', description: 'Promise-based HTTP client for API calls' },
      { name: 'React Router', category: 'Routing', description: 'Declarative routing for React applications' }
    ],
    backend: [
      { name: 'Node.js', category: 'Runtime', description: 'JavaScript runtime for server-side development' },
      { name: 'Express.js', category: 'Framework', description: 'Fast, unopinionated web framework' },
      { name: 'Multer', category: 'File Upload', description: 'Middleware for handling multipart/form-data' },
      { name: 'CORS', category: 'Security', description: 'Cross-Origin Resource Sharing middleware' },
      { name: 'Express Validator', category: 'Validation', description: 'Server-side data validation' }
    ],
    ai: [
      { name: 'Python 3.10', category: 'Language', description: 'High-level programming language for AI/ML' },
      { name: 'FastAPI', category: 'Framework', description: 'Modern, fast web framework for building APIs' },
      { name: 'Google Gemini', category: 'AI Model', description: 'Advanced large language model for analysis' },
      { name: 'Pandas', category: 'Data Processing', description: 'Data manipulation and analysis library' },
      { name: 'NumPy', category: 'Numerical Computing', description: 'Fundamental package for scientific computing' },
      { name: 'Sentence Transformers', category: 'NLP', description: 'Library for sentence embeddings' },
      { name: 'Scikit-learn', category: 'Machine Learning', description: 'Machine learning library for Python' }
    ],
    infrastructure: [
      { name: 'Docker', category: 'Containerization', description: 'Container platform for application deployment' },
      { name: 'Docker Compose', category: 'Orchestration', description: 'Multi-container Docker application management' },
      { name: 'Nginx', category: 'Web Server', description: 'High-performance web server and reverse proxy' },
      { name: 'PostgreSQL', category: 'Database', description: 'Advanced open-source relational database' }
    ]
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ pt: 3, pb: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link color="inherit" href="/" sx={{ display: 'flex', alignItems: 'center' }}>
            <Home sx={{ mr: 0.5 }} fontSize="inherit" />
            Dashboard
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <HelpIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Help & Documentation
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
            AI Reporting Agent
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
            System Documentation & Architecture Guide
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
            Comprehensive guide to understanding the AI-powered reporting system, its architecture, 
            technologies, and how each component works together to deliver intelligent document analysis.
          </Typography>
        </Box>

        {/* System Overview Alert */}
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            System Overview
          </Typography>
          <Typography variant="body2">
            This AI Reporting Agent is a sophisticated three-tier architecture system that combines 
            modern web technologies with advanced AI capabilities to provide intelligent document 
            analysis, data extraction, and actionable insights.
          </Typography>
        </Alert>

        {/* Architecture Overview */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Architecture color="primary" />
            System Architecture
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            The system follows a microservices architecture with three main services:
          </Typography>
          
          <Grid container spacing={3}>
            {Object.entries(systemArchitecture).map(([key, service]) => (
              <Grid item xs={12} md={4} key={key}>
                <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
                  <CardHeader
                    title={service.name}
                    subheader={service.technology}
                    sx={{ pb: 1 }}
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {service.description}
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      Key Features:
                    </Typography>
                    <List dense>
                      {service.features.map((feature, index) => (
                        <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={feature}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Technology Stack:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {service.stack.map((tech) => (
                        <Chip key={tech} label={tech} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* AI Analysis Flow */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SmartToy color="primary" />
            AI Analysis Process
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Step-by-step breakdown of how documents are processed and analyzed:
          </Typography>
          
          <Grid container spacing={2}>
            {aiAnalysisFlow.map((step, index) => (
              <Grid item xs={12} sm={6} md={4} key={step.step}>
                <Card sx={{ height: '100%', position: 'relative' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                          fontWeight: 'bold'
                        }}
                      >
                        {step.step}
                      </Box>
                      <Typography variant="h6" component="h3">
                        {step.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {step.description}
                    </Typography>
                    <Chip 
                      label={step.technology} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Technology Stack */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Code color="primary" />
            Technology Stack
          </Typography>
          
          {Object.entries(technologies).map(([category, techs]) => (
            <Box key={category} sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ textTransform: 'capitalize', color: 'primary.main' }}>
                {category} Technologies
              </Typography>
              <Grid container spacing={2}>
                {techs.map((tech) => (
                  <Grid item xs={12} sm={6} md={4} key={tech.name}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" component="h3" gutterBottom>
                          {tech.name}
                        </Typography>
                        <Chip 
                          label={tech.category} 
                          size="small" 
                          color="secondary" 
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {tech.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Paper>

        {/* Detailed Sections */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Storage color="primary" />
            Detailed System Components
          </Typography>
          
          {/* Frontend Details */}
          <Accordion expanded={expanded === 'frontend'} onChange={handleChange('frontend')}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WebIcon color="primary" />
                Frontend Service (React Application)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" paragraph>
                The frontend is built with React 18 and provides a modern, responsive user interface. 
                It uses Material-UI for consistent design and Recharts for data visualization.
              </Typography>
              <Typography variant="h6" gutterBottom>Key Components:</Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Dashboard" 
                    secondary="Main interface showing KPIs, charts, and analysis results"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Upload Area" 
                    secondary="Drag & drop file upload with progress tracking"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Chat Interface" 
                    secondary="AI-powered chat for natural language queries"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Settings Modal" 
                    secondary="Comprehensive settings management with multiple tabs"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Notification System" 
                    secondary="Real-time notifications and alerts"
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          {/* Backend Details */}
          <Accordion expanded={expanded === 'backend'} onChange={handleChange('backend')}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ApiIcon color="primary" />
                Backend Service (Node.js API)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" paragraph>
                The backend service handles all API requests, file processing, and business logic. 
                It acts as a bridge between the frontend and AI services.
              </Typography>
              <Typography variant="h6" gutterBottom>API Endpoints:</Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="POST /api/upload" 
                    secondary="File upload endpoint with validation and storage"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="GET /api/summary/:id" 
                    secondary="Retrieve document summary and analysis"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="GET /api/kpi/:id" 
                    secondary="Get key performance indicators"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="GET /api/trend/:id" 
                    secondary="Retrieve trend analysis data"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="POST /api/chat" 
                    secondary="AI chat interface endpoint"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="GET/PUT /api/settings" 
                    secondary="Settings management endpoints"
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          {/* AI Service Details */}
          <Accordion expanded={expanded === 'ai'} onChange={handleChange('ai')}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PsychologyIcon color="primary" />
                AI Service (Python + FastAPI)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" paragraph>
                The AI service is the core intelligence of the system, powered by Google Gemini 
                and advanced natural language processing techniques.
              </Typography>
              <Typography variant="h6" gutterBottom>AI Capabilities:</Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Document Parsing" 
                    secondary="Extract text and data from PDF, CSV, and Excel files"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Chunk Processing" 
                    secondary="Split documents into manageable chunks for analysis"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Vector Embeddings" 
                    secondary="Create semantic embeddings for similarity search"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="KPI Extraction" 
                    secondary="Identify and extract key performance indicators"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Trend Analysis" 
                    secondary="Analyze patterns and trends in the data"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Insight Generation" 
                    secondary="Generate actionable insights and recommendations"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Natural Language Queries" 
                    secondary="Answer questions about the data in natural language"
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          {/* Chunk and Embedding System */}
          <Accordion expanded={expanded === 'chunking'} onChange={handleChange('chunking')}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DataUsageIcon color="primary" />
                Chunk & Embedding System
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" paragraph>
                The system uses advanced text chunking and vector embeddings to process large documents 
                efficiently and enable semantic search capabilities.
              </Typography>
              <Typography variant="h6" gutterBottom>Process:</Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Text Chunking" 
                    secondary="Split documents into 512-token chunks with overlap for context preservation"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Embedding Generation" 
                    secondary="Create vector embeddings using Sentence Transformers (all-MiniLM-L6-v2)"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Vector Storage" 
                    secondary="Store embeddings in PostgreSQL with pgvector extension"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Similarity Search" 
                    secondary="Perform cosine similarity search for relevant content retrieval"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Context Assembly" 
                    secondary="Combine relevant chunks to provide context for AI analysis"
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          {/* AI Models */}
          <Accordion expanded={expanded === 'models'} onChange={handleChange('models')}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SmartToyIcon color="primary" />
                AI Models & Configuration
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" paragraph>
                The system uses Google Gemini as the primary AI model, configured with specific 
                parameters for optimal performance.
              </Typography>
              <Typography variant="h6" gutterBottom>Model Configuration:</Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Primary Model" 
                    secondary="Google Gemini Pro - Advanced language understanding and generation"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Temperature" 
                    secondary="0.7 - Balanced creativity and consistency"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Max Tokens" 
                    secondary="2048 - Sufficient for detailed analysis and responses"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Timeout" 
                    secondary="30 seconds - Reasonable response time for complex queries"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Embedding Model" 
                    secondary="all-MiniLM-L6-v2 - Efficient sentence embeddings"
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>
        </Paper>

        {/* Getting Started */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SpeedIcon color="primary" />
            Getting Started
          </Typography>
          <Typography variant="body1" paragraph>
            To start using the AI Reporting Agent, follow these simple steps:
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="1. Upload a Document" 
                secondary="Drag and drop a PDF, CSV, or Excel file onto the upload area"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="2. Wait for Analysis" 
                secondary="The AI will process your document and extract key insights"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="3. Explore Results" 
                secondary="View KPIs, trends, and summaries in the dashboard"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="4. Ask Questions" 
                secondary="Use the chat interface to ask questions about your data"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="5. Customize Settings" 
                secondary="Adjust AI models, display preferences, and other settings"
              />
            </ListItem>
          </List>
        </Paper>

        {/* Back to Dashboard */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            href="/"
            sx={{ px: 4, py: 1.5 }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Help;
