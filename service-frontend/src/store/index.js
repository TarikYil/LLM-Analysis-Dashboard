import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// App store - No authentication required
export const useAppStore = create(
  devtools(
    (set, get) => ({
      isLoading: false,
      error: null,

      // Actions
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'app-store',
    }
  )
);

// Reports store
export const useReportsStore = create(
  devtools(
    (set, get) => ({
      reports: [],
      currentReport: null,
      isLoading: false,
      error: null,
      uploadProgress: 0,
      
      // Filters and pagination
      filters: {
        search: '',
        dateRange: null,
        type: 'all',
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
      },

      // Actions
      setReports: (reports) => set({ reports }),
      setCurrentReport: (currentReport) => set({ currentReport }),
      addReport: (report) => set((state) => {
        // Check if report already exists to avoid duplicates
        const exists = state.reports.some(r => r.id === report.id);
        if (exists) {
          return state;
        }
        return { 
          reports: [report, ...state.reports] 
        };
      }),
      updateReport: (reportId, updates) => set((state) => ({
        reports: state.reports.map(report => 
          report.id === reportId ? { ...report, ...updates } : report
        )
      })),
      removeReport: (reportId) => set((state) => ({
        reports: state.reports.filter(report => report.id !== reportId)
      })),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      setUploadProgress: (uploadProgress) => set({ uploadProgress }),
      setFilters: (filters) => set((state) => ({ 
        filters: { ...state.filters, ...filters }
      })),
      setPagination: (pagination) => set((state) => ({ 
        pagination: { ...state.pagination, ...pagination }
      })),
    }),
    {
      name: 'reports-store',
    }
  )
);

// Dashboard store
export const useDashboardStore = create(
  devtools(
    (set, get) => ({
      kpis: [],
      trends: [],
      insights: [],
      summary: null,
      actionItems: [],
      isLoading: false,
      error: null,
      
      // Chat state
      chatMessages: [],
      isChatLoading: false,
      chatError: null,

      // Actions
      setKPIs: (kpis) => set({ kpis }),
      setTrends: (trends) => set({ trends }),
      setInsights: (insights) => set({ insights }),
      setSummary: (summary) => {
        console.log('📊 Store setSummary called with:', summary);
        console.log('📊 Store setSummary - summary type:', typeof summary);
        console.log('📊 Store setSummary - summary keys:', Object.keys(summary || {}));
        console.log('📊 Store setSummary - summary.summary:', summary?.summary);
        console.log('📊 Store setSummary - summary.summary type:', typeof summary?.summary);
        set({ summary });
        console.log('📊 Store setSummary completed');
      },
      setActionItems: (actionItems) => set({ actionItems }),
      clearDashboard: () => set({ 
        kpis: [], 
        trends: [], 
        insights: [], 
        summary: null, 
        actionItems: [],
        chatMessages: []
      }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      
      // Chat actions
      addChatMessage: (message) => set((state) => ({
        chatMessages: [...state.chatMessages, message]
      })),
      setChatMessages: (chatMessages) => set({ chatMessages }),
      setChatLoading: (isChatLoading) => set({ isChatLoading }),
      setChatError: (chatError) => set({ chatError }),
      clearChatError: () => set({ chatError: null }),
    }),
    {
      name: 'dashboard-store',
    }
  )
);

// UI store for global UI state
export const useUIStore = create(
  devtools(
    (set, get) => ({
      sidebarOpen: true,
      theme: 'light',
      notifications: [],
      
      // Actions
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setTheme: (theme) => set({ theme }),
      addNotification: (notification) => set((state) => ({
        notifications: [...state.notifications, {
          id: Date.now(),
          timestamp: new Date(),
          ...notification
        }]
      })),
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      clearAllNotifications: () => set({ notifications: [] }),
      updateNotification: (id, updates) => set((state) => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, ...updates } : n
        )
      })),
    }),
    {
      name: 'ui-store',
    }
  )
);
