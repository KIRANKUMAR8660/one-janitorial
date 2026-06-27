import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Thunks
export const loginThunk = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const res = await axios.post('/api/auth/login', credentials);
    // Set headers
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.accessToken}`;
    localStorage.setItem('accessToken', res.data.accessToken);
    localStorage.setItem('role', res.data.role);
    localStorage.setItem('email', res.data.email);
    localStorage.setItem('userId', res.data.userId);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

export const logoutThunk = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await axios.post('/api/auth/logout');
    delete axios.defaults.headers.common['Authorization'];
    localStorage.clear();
    return {};
  } catch (err) {
    localStorage.clear();
    return rejectWithValue(err.response.data);
  }
});

// Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    accessToken: localStorage.getItem('accessToken') || null,
    role: localStorage.getItem('role') || null,
    email: localStorage.getItem('email') || null,
    userId: localStorage.getItem('userId') || null,
    loading: false,
    error: null,
  },
  reducers: {
    restoreSession: (state) => {
      state.accessToken = localStorage.getItem('accessToken');
      state.role = localStorage.getItem('role');
      state.email = localStorage.getItem('email');
      state.userId = localStorage.getItem('userId');
      if (state.accessToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${state.accessToken}`;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.role = action.payload.role;
        state.email = action.payload.email;
        state.userId = action.payload.userId;
      })
      .addCase(loginThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload?.message || 'Login failed'; })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.accessToken = null;
        state.role = null;
        state.email = null;
        state.userId = null;
      });
  }
});

// App State Slice (tasks, employees, channels, tickets, dashboard, logs)
const appSlice = createSlice({
  name: 'app',
  initialState: {
    employees: [],
    tasks: [],
    channels: [],
    messages: [],
    meetings: [],
    deals: [],
    leads: [],
    tickets: [],
    bcoProjects: [],
    jobPostings: [],
    performanceRecords: [],
    aiAgents: [],
    sopDocuments: [],
    metrics: {
      employeesCount: 0,
      activeTasksCount: 0,
      openTicketsCount: 0,
      totalDealsCount: 0,
      talkTimeSeconds: 0,
      callsMade: 0,
      missedCalls: 0
    },
    notifications: [],
    auditLogs: [],
    loading: false,
    error: null
  },
  reducers: {
    setEmployees: (state, action) => { state.employees = action.payload; },
    setTasks: (state, action) => { state.tasks = action.payload; },
    setChannels: (state, action) => { state.channels = action.payload; },
    setMessages: (state, action) => { state.messages = action.payload; },
    addMessage: (state, action) => { state.messages.push(action.payload); },
    setMeetings: (state, action) => { state.meetings = action.payload; },
    setDeals: (state, action) => { state.deals = action.payload; },
    setLeads: (state, action) => { state.leads = action.payload; },
    setTickets: (state, action) => { state.tickets = action.payload; },
    setBcoProjects: (state, action) => { state.bcoProjects = action.payload; },
    setJobPostings: (state, action) => { state.jobPostings = action.payload; },
    setPerformanceRecords: (state, action) => { state.performanceRecords = action.payload; },
    setAIAgents: (state, action) => { state.aiAgents = action.payload; },
    setSopDocuments: (state, action) => { state.sopDocuments = action.payload; },
    setMetrics: (state, action) => { state.metrics = action.payload; },
    setAuditLogs: (state, action) => { state.auditLogs = action.payload; },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
    },
    clearNotifications: (state) => { state.notifications = []; }
  }
});

export const { restoreSession } = authSlice.actions;
export const {
  setEmployees,
  setTasks,
  setChannels,
  setMessages,
  addMessage,
  setMeetings,
  setDeals,
  setLeads,
  setTickets,
  setBcoProjects,
  setJobPostings,
  setPerformanceRecords,
  setAIAgents,
  setSopDocuments,
  setMetrics,
  setAuditLogs,
  addNotification,
  clearNotifications
} = appSlice.actions;

// Async API Actions
export const fetchDashboardMetrics = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/dashboard/metrics');
    dispatch(setMetrics(res.data));
  } catch (err) { console.error(err); }
};

export const fetchEmployees = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/employees');
    dispatch(setEmployees(res.data));
  } catch (err) { console.error(err); }
};

export const fetchTasks = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/tasks');
    dispatch(setTasks(res.data));
  } catch (err) { console.error(err); }
};

export const fetchChannels = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/channels');
    dispatch(setChannels(res.data));
  } catch (err) { console.error(err); }
};

export const fetchMessages = (channelId) => async (dispatch) => {
  try {
    const res = await axios.get(`/api/channels/${channelId}/messages`);
    dispatch(setMessages(res.data));
  } catch (err) { console.error(err); }
};

export const fetchMeetings = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/meetings');
    dispatch(setMeetings(res.data));
  } catch (err) { console.error(err); }
};

export const fetchTickets = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/tickets');
    dispatch(setTickets(res.data));
  } catch (err) { console.error(err); }
};

export const fetchDeals = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/crm/deals');
    dispatch(setDeals(res.data));
  } catch (err) { console.error(err); }
};

export const fetchLeads = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/crm/leads');
    dispatch(setLeads(res.data));
  } catch (err) { console.error(err); }
};

export const fetchBcoProjects = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/bco/projects');
    dispatch(setBcoProjects(res.data));
  } catch (err) { console.error(err); }
};

export const fetchJobPostings = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/hr/postings');
    dispatch(setJobPostings(res.data));
  } catch (err) { console.error(err); }
};

export const fetchPerformanceRecords = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/performance');
    dispatch(setPerformanceRecords(res.data));
  } catch (err) { console.error(err); }
};

export const fetchAIAgents = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/ai/agents');
    dispatch(setAIAgents(res.data));
  } catch (err) { console.error(err); }
};

export const fetchSopDocuments = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/sop/documents');
    dispatch(setSopDocuments(res.data));
  } catch (err) { console.error(err); }
};

export const fetchAuditLogs = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/admin/audit-logs');
    dispatch(setAuditLogs(res.data));
  } catch (err) { console.error(err); }
};

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    app: appSlice.reducer
  }
});
export default store;
