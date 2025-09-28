import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Settings,
  Save,
  Refresh,
  Notifications,
  Language,
  Palette,
  Speed,
} from '@mui/icons-material';
import { settingsAPI } from '../../services/api';

const SettingsModal = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Settings state
  const [settings, setSettings] = useState({
    // General settings
    language: 'en',
    theme: 'light',
    autoSave: true,
    
    // Notification settings
    notifications: {
      enabled: true,
      sound: true,
      email: false,
      push: true,
    },
    
    // Performance settings
    performance: {
      autoRefresh: true,
      refreshInterval: 30, // seconds
      cacheSize: 100, // MB
      maxConcurrentRequests: 5,
    },
    
    // AI settings
    ai: {
      model: 'gemini-pro',
      temperature: 0.7,
      maxTokens: 2048,
      timeout: 30, // seconds
    },
    
    // Display settings
    display: {
      chartType: 'line',
      showGrid: true,
      showLegend: true,
      animationSpeed: 'medium',
    }
  });

  // Load settings from backend
  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await settingsAPI.getSettings();
      if (response.success && response.data) {
        setSettings(response.data);
        console.log('✅ Settings loaded successfully:', response.data);
      } else {
        throw new Error('Invalid response format');
      }
      
    } catch (err) {
      console.error('❌ Error loading settings:', err);
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // Save settings to backend
  const saveSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await settingsAPI.updateSettings(settings);
      if (response.success) {
        setSuccess(response.message || 'Settings saved successfully');
        console.log('✅ Settings saved successfully:', response.data);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(response.message || 'Failed to save settings');
      }
      
    } catch (err) {
      console.error('❌ Error saving settings:', err);
      setError(err.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  // Reset settings to default
  const resetSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await settingsAPI.resetSettings();
      if (response.success && response.data) {
        setSettings(response.data);
        setSuccess(response.message || 'Settings reset to default');
        console.log('✅ Settings reset successfully:', response.data);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(response.message || 'Failed to reset settings');
      }
      
    } catch (err) {
      console.error('❌ Error resetting settings:', err);
      setError(err.message || 'Failed to reset settings');
    } finally {
      setLoading(false);
    }
  };

  // Handle setting changes
  const handleSettingChange = (path, value) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  // Load settings when modal opens
  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open]);

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '600px',
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Settings />
          <Typography variant="h6" component="div">
            Settings
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {error && (
          <Alert severity="error" sx={{ m: 2, mb: 0 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ m: 2, mb: 0 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            aria-label="settings tabs"
          >
            <Tab icon={<Settings />} label="General" />
            <Tab icon={<Notifications />} label="Notifications" />
            <Tab icon={<Speed />} label="Performance" />
            <Tab icon={<Palette />} label="Display" />
            <Tab icon={<Settings />} label="AI" />
          </Tabs>
        </Box>

        {/* General Settings */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={settings.language}
                  label="Language"
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="tr">Türkçe</MenuItem>
                  <MenuItem value="es">Español</MenuItem>
                  <MenuItem value="fr">Français</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Theme</InputLabel>
                <Select
                  value={settings.theme}
                  label="Theme"
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="auto">Auto</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoSave}
                    onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                  />
                }
                label="Auto-save changes"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Notification Settings */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.enabled}
                    onChange={(e) => handleSettingChange('notifications.enabled', e.target.checked)}
                  />
                }
                label="Enable notifications"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.sound}
                    onChange={(e) => handleSettingChange('notifications.sound', e.target.checked)}
                    disabled={!settings.notifications.enabled}
                  />
                }
                label="Notification sound"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.push}
                    onChange={(e) => handleSettingChange('notifications.push', e.target.checked)}
                    disabled={!settings.notifications.enabled}
                  />
                }
                label="Push notifications"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.email}
                    onChange={(e) => handleSettingChange('notifications.email', e.target.checked)}
                    disabled={!settings.notifications.enabled}
                  />
                }
                label="Email notifications"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Performance Settings */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.performance.autoRefresh}
                    onChange={(e) => handleSettingChange('performance.autoRefresh', e.target.checked)}
                  />
                }
                label="Auto-refresh data"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography gutterBottom>
                Refresh interval: {settings.performance.refreshInterval} seconds
              </Typography>
              <Slider
                value={settings.performance.refreshInterval}
                onChange={(e, value) => handleSettingChange('performance.refreshInterval', value)}
                min={10}
                max={300}
                step={10}
                marks={[
                  { value: 10, label: '10s' },
                  { value: 60, label: '1m' },
                  { value: 300, label: '5m' },
                ]}
                disabled={!settings.performance.autoRefresh}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography gutterBottom>
                Cache size: {settings.performance.cacheSize} MB
              </Typography>
              <Slider
                value={settings.performance.cacheSize}
                onChange={(e, value) => handleSettingChange('performance.cacheSize', value)}
                min={50}
                max={500}
                step={50}
                marks={[
                  { value: 50, label: '50MB' },
                  { value: 250, label: '250MB' },
                  { value: 500, label: '500MB' },
                ]}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Max concurrent requests"
                type="number"
                value={settings.performance.maxConcurrentRequests}
                onChange={(e) => handleSettingChange('performance.maxConcurrentRequests', parseInt(e.target.value))}
                inputProps={{ min: 1, max: 20 }}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Display Settings */}
        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Default chart type</InputLabel>
                <Select
                  value={settings.display.chartType}
                  label="Default chart type"
                  onChange={(e) => handleSettingChange('display.chartType', e.target.value)}
                >
                  <MenuItem value="line">Line Chart</MenuItem>
                  <MenuItem value="bar">Bar Chart</MenuItem>
                  <MenuItem value="pie">Pie Chart</MenuItem>
                  <MenuItem value="area">Area Chart</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Animation speed</InputLabel>
                <Select
                  value={settings.display.animationSpeed}
                  label="Animation speed"
                  onChange={(e) => handleSettingChange('display.animationSpeed', e.target.value)}
                >
                  <MenuItem value="slow">Slow</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="fast">Fast</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.display.showGrid}
                    onChange={(e) => handleSettingChange('display.showGrid', e.target.checked)}
                  />
                }
                label="Show chart grid"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.display.showLegend}
                    onChange={(e) => handleSettingChange('display.showLegend', e.target.checked)}
                  />
                }
                label="Show chart legend"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* AI Settings */}
        <TabPanel value={activeTab} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>AI Model</InputLabel>
                <Select
                  value={settings.ai.model}
                  label="AI Model"
                  onChange={(e) => handleSettingChange('ai.model', e.target.value)}
                >
                  <MenuItem value="gemini-pro">Gemini Pro</MenuItem>
                  <MenuItem value="gemini-pro-vision">Gemini Pro Vision</MenuItem>
                  <MenuItem value="gpt-4">GPT-4</MenuItem>
                  <MenuItem value="claude-3">Claude 3</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Tokens"
                type="number"
                value={settings.ai.maxTokens}
                onChange={(e) => handleSettingChange('ai.maxTokens', parseInt(e.target.value))}
                inputProps={{ min: 100, max: 4096 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography gutterBottom>
                Temperature: {settings.ai.temperature}
              </Typography>
              <Slider
                value={settings.ai.temperature}
                onChange={(e, value) => handleSettingChange('ai.temperature', value)}
                min={0}
                max={1}
                step={0.1}
                marks={[
                  { value: 0, label: '0' },
                  { value: 0.5, label: '0.5' },
                  { value: 1, label: '1' },
                ]}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Timeout (seconds)"
                type="number"
                value={settings.ai.timeout}
                onChange={(e) => handleSettingChange('ai.timeout', parseInt(e.target.value))}
                inputProps={{ min: 10, max: 120 }}
              />
            </Grid>
          </Grid>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={resetSettings}
          variant="outlined"
          startIcon={<Refresh />}
          disabled={loading}
        >
          Reset
        </Button>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={loading}
        >
          Cancel
        </Button>
        
        <Button
          onClick={saveSettings}
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} /> : <Save />}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsModal;
