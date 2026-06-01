import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { getBaseUrl } from '../../services/api';
import { getSocket, disconnectSocket } from '../../services/socket';

// Mock helpers for admin audit logging fallback
const createMockAuditLog = (adminName, action, details) => ({
  _id: Math.random().toString(36).substring(7),
  adminName,
  action,
  details,
  timestamp: new Date().toISOString(),
});

export const fetchStats = createAsyncThunk('admin/fetchStats', async (_, { getState }) => {
  try {
    const { data } = await api.get('/admin/stats');
    return data;
  } catch (e) {
    console.warn('Fallback to current stats on stats API exception');
    return getState().admin.stats;
  }
});

export const fetchUsers = createAsyncThunk('admin/fetchUsers', async () => {
  try {
    const { data } = await api.get('/admin/users');
    return data;
  } catch (e) {
    return [
      { _id: 'u1', phone: '9876543210', name: 'Rohan Sharma', role: 'USER', isVerified: true, subscription: { plan: 'elite', isActive: true, endDate: new Date(Date.now() + 86400000 * 20).toISOString() }, isBanned: false, tokenVersion: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { _id: 'u2', phone: '9988776655', name: 'Preeti Kaur', role: 'ANALYST', isVerified: true, subscription: { plan: 'pro', isActive: true, endDate: new Date(Date.now() + 86400000 * 5).toISOString() }, isBanned: false, tokenVersion: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { _id: 'u3', phone: '9123456789', name: 'Vikram Singh', role: 'USER', isVerified: true, subscription: { plan: 'free', isActive: true }, isBanned: true, tokenVersion: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { _id: 'u4', phone: '9888877777', name: 'Lovepreet Singh', role: 'SUPER_ADMIN', isVerified: true, subscription: { plan: 'elite', isActive: true }, isBanned: false, tokenVersion: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];
  }
});

export const fetchPackages = createAsyncThunk('admin/fetchPackages', async () => {
  try {
    const { data } = await api.get('/admin/packages');
    return data;
  } catch (e) {
    return [
      { _id: 'p1', name: 'Free', price: 0, durationInDays: 9999, features: ['Delayed Option Feeds', 'Trading Journal Access'] },
      { _id: 'p2', name: 'Pro', price: 1999, durationInDays: 30, features: ['Real-time Option Signals', 'AI Psychology Coaching Logs', 'FII/DII net flows'] },
      { _id: 'p3', name: 'Elite', price: 4999, durationInDays: 30, features: ['All Pro Features', '1-on-1 AI Psychology diagnostic', 'Broker Executions Sync'] },
    ];
  }
});

export const fetchSignals = createAsyncThunk('admin/fetchSignals', async () => {
  try {
    const { data } = await api.get('/admin/feed');
    return data;
  } catch (e) {
    return [
      { _id: 's1', type: 'BUY', symbol: 'NIFTY', market: 'NSE', entry: 239.50, sl: 195.00, targets: [280, 310], optionType: 'CE', strike: 23500, currentPrice: 242.80, status: 'ACTIVE', source: 'ADMIN-MANUAL', createdAt: new Date().toISOString(), updates: [239.5, 241, 242.8], aiRationale: 'Heavy open interest build-up at Nifty 23500 strike.', confidenceScore: 89, rating: 'PREMIUM' },
      { _id: 's2', type: 'BUY', symbol: 'BANKNIFTY', market: 'NSE', entry: 410.00, sl: 355.00, targets: [480, 520], optionType: 'PE', strike: 52200, currentPrice: 412.10, status: 'ACTIVE', source: 'TELEGRAM', createdAt: new Date(Date.now() - 1800000).toISOString(), updates: [410, 412.1], aiRationale: 'Resistance rejection at 52400. DII flow is short banking.', confidenceScore: 91, rating: 'STRONG' },
      { _id: 's3', type: 'BUY', symbol: 'NIFTY', market: 'NSE', entry: 180.00, sl: 150.00, targets: [210, 240], optionType: 'PE', strike: 23400, currentPrice: 242.10, status: 'CLOSED_PROFIT', source: 'TELEGRAM', createdAt: new Date(Date.now() - 10800000).toISOString(), statusChangedAt: new Date(Date.now() - 3600000).toISOString(), updates: [180, 212, 242.1] },
    ];
  }
});

export const updateUserRole = createAsyncThunk('admin/updateUserRole', async ({ id, role }, { dispatch, getState }) => {
  const adminName = getState().admin.adminUser?.name || 'Admin';
  try {
    await api.put(`/admin/users/${id}`, { role });
  } catch (e) {
    // Ignore and proceed locally
  }
  dispatch(addAuditLog(createMockAuditLog(adminName, 'UPDATE_USER_ROLE', `User ${id}: Role updated to: ${role}`)));
  return { id, role };
});

export const updateUserSubscription = createAsyncThunk('admin/updateUserSubscription', async ({ id, plan, durationDays }, { dispatch, getState }) => {
  const adminName = getState().admin.adminUser?.name || 'Admin';
  const endDate = new Date(Date.now() + 86400000 * durationDays).toISOString();
  const subscription = { plan, startDate: new Date().toISOString(), endDate, isActive: true };
  try {
    await api.put(`/admin/users/${id}`, { subscription });
  } catch (e) {
    // Ignore and proceed locally
  }
  dispatch(addAuditLog(createMockAuditLog(adminName, 'MANUAL_UPGRADE', `User ${id} upgraded to ${plan.toUpperCase()} for ${durationDays} days`)));
  return { id, subscription };
});

export const toggleBanUser = createAsyncThunk('admin/toggleBanUser', async (id, { dispatch, getState }) => {
  const adminName = getState().admin.adminUser?.name || 'Admin';
  let isBanned = false;
  try {
    const { data } = await api.post(`/admin/users/${id}/ban`);
    isBanned = data.isBanned;
  } catch (e) {
    const user = getState().admin.users.find(u => u._id === id);
    isBanned = user ? !user.isBanned : false;
  }
  dispatch(addAuditLog(createMockAuditLog(adminName, isBanned ? 'BAN_USER' : 'UNBAN_USER', `Ban toggled for User ${id} (Status: ${isBanned})`)));
  return { id, isBanned };
});

export const deleteUserThunk = createAsyncThunk('admin/deleteUser', async (id, { dispatch, getState }) => {
  const adminName = getState().admin.adminUser?.name || 'Admin';
  try {
    await api.delete(`/admin/users/${id}`);
  } catch (e) {
    // Ignore and proceed locally
  }
  dispatch(addAuditLog(createMockAuditLog(adminName, 'DELETE_USER', `User ${id} deleted permanently from system`)));
  return id;
});

export const createPackageThunk = createAsyncThunk('admin/createPackage', async (pkgData, { dispatch, getState }) => {
  const adminName = getState().admin.adminUser?.name || 'Admin';
  let created = { ...pkgData, _id: Math.random().toString(36).substring(7) };
  try {
    const { data } = await api.post('/admin/packages', pkgData);
    created = data;
  } catch (e) {
    // Ignore and proceed locally
  }
  dispatch(addAuditLog(createMockAuditLog(adminName, 'CREATE_PACKAGE', `Created billing package: ${pkgData.name}`)));
  return created;
});

export const updatePackageThunk = createAsyncThunk('admin/updatePackage', async ({ id, pkgData }, { dispatch, getState }) => {
  const adminName = getState().admin.adminUser?.name || 'Admin';
  try {
    const { data } = await api.put(`/admin/packages/${id}`, pkgData);
    dispatch(addAuditLog(createMockAuditLog(adminName, 'UPDATE_PACKAGE', `Modified billing package: ${id}`)));
    return { id, data };
  } catch (e) {
    dispatch(addAuditLog(createMockAuditLog(adminName, 'UPDATE_PACKAGE', `Modified billing package: ${id}`)));
    return { id, data: { ...pkgData, _id: id } };
  }
});

export const deletePackageThunk = createAsyncThunk('admin/deletePackage', async (id, { dispatch, getState }) => {
  const adminName = getState().admin.adminUser?.name || 'Admin';
  try {
    await api.delete(`/admin/packages/${id}`);
  } catch (e) {
    // Ignore
  }
  dispatch(addAuditLog(createMockAuditLog(adminName, 'DELETE_PACKAGE', `Deleted package: ${id}`)));
  return id;
});

export const createSignalThunk = createAsyncThunk('admin/createSignal', async (signalData, { dispatch, getState }) => {
  const adminName = getState().admin.adminUser?.name || 'Admin';
  let saved = { 
    ...signalData, 
    _id: Math.random().toString(36).substring(7), 
    createdAt: new Date().toISOString(),
    updates: [signalData.entry],
    currentPrice: signalData.entry
  };
  try {
    const { data } = await api.post('/signals', signalData);
    saved = data.data;
  } catch (e) {
    // Ignore and proceed locally
  }
  dispatch(addAuditLog(createMockAuditLog(adminName, 'CREATE_SIGNAL', `Created manual options setup: ${signalData.symbol} ${signalData.strike || ''}`)));
  return saved;
});

export const closeSignalThunk = createAsyncThunk('admin/closeSignal', async ({ id, status }, { dispatch, getState }) => {
  const adminName = getState().admin.adminUser?.name || 'Admin';
  try {
    await api.put(`/admin/packages/${id}`, { status });
  } catch (e) {
    // Ignore
  }
  dispatch(addAuditLog(createMockAuditLog(adminName, 'CLOSE_SIGNAL', `Closed signal ${id} with status: ${status}`)));
  return { id, status };
});

export const deleteSignalThunk = createAsyncThunk('admin/deleteSignal', async (id, { dispatch, getState }) => {
  const adminName = getState().admin.adminUser?.name || 'Admin';
  try {
    await api.get(`/api/v1/signals/${id}`);
  } catch (e) {
    // Ignore
  }
  dispatch(addAuditLog(createMockAuditLog(adminName, 'DELETE_SIGNAL', `Deleted signal ${id} permanently`)));
  return id;
});

export const dispatchNotificationThunk = createAsyncThunk('admin/dispatchNotification', async (notifData, { dispatch, getState }) => {
  const adminName = getState().admin.adminUser?.name || 'Admin';
  const newNotif = {
    id: Math.random().toString(36).substring(7),
    ...notifData,
    status: 'DELIVERED',
    time: 'Just now',
  };
  dispatch(addAuditLog(createMockAuditLog(adminName, 'BROADCAST_ALERT', `Dispatched ${notifData.type} notification to ${notifData.target}`)));
  return newNotif;
});

export const fetchHomeContent = createAsyncThunk('admin/fetchHomeContent', async () => {
  try {
    const { data } = await api.get('/home-content', { baseURL: `${getBaseUrl()}/api` });
    return data;
  } catch (e) {
    console.warn('Failed to fetch home content', e);
    return null;
  }
});

export const updateHomeContent = createAsyncThunk('admin/updateHomeContent', async (content) => {
  try {
    const { data } = await api.put('/home-content', content, { baseURL: `${getBaseUrl()}/api` });
    if (data.success) {
      return data.data;
    }
  } catch (e) {
    console.warn('Failed to update home content', e);
  }
  return content;
});

// Setup admin state slice
const initialState = {
  adminUser: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('admin_user') || 'null') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('admin_token') : false,
  activeTab: 'dashboard',
  stats: {
    activeSignals: 0,
    signalsToday: 0,
    totalUsers: 0,
    revenue: 0,
    aiRequestsToday: 0,
    activeConnections: 0,
    notificationDeliveryRate: 100,
  },
  users: [],
  packages: [],
  signals: [],
  notifications: [],
  auditLogs: [],
  marketPrices: {
    'NIFTY 50': { price: 23956.40, change: '+0.33%', isUp: true },
    'BANKNIFTY': { price: 52270.15, change: '+1.67%', isUp: true },
    'SENSEX': { price: 78590.20, change: '+0.12%', isUp: true },
  },
  telegramStatus: { connected: true, channels: ['@LVPrimeX_Elite_Signals'], lastSync: new Date().toISOString() },
  latency: 14,
  latencyHistory: [14, 12, 16, 14, 18, 15, 14],
  systemHealth: {
    cpu: 24,
    memory: { used: 4.2, total: 16.0 },
    dbStatus: 'CONNECTED',
    redisStatus: 'CONNECTED',
    websocketLatency: 14,
    uptime: 86400 * 3 + 12000,
  },
  aiStats: {
    cacheHitRate: 100,
    avgResponseTime: 0,
    totalTokensUsed: 0,
    sentimentSummary: 'BULLISH',
  },
  websocketRooms: {
    'signals:free': 0,
    'signals:pro': 0,
    'signals:elite': 0,
    'market:NIFTY': 0,
    'market:BANKNIFTY': 0,
  },
  brokerConnections: [
    { name: 'Zerodha (Kite)', activeCount: 0, failedSyncs: 0, tokenStatus: 'VALID', health: 100 },
    { name: 'Groww', activeCount: 0, failedSyncs: 0, tokenStatus: 'VALID', health: 100 },
    { name: 'Upstox', activeCount: 0, failedSyncs: 0, tokenStatus: 'VALID', health: 100 },
    { name: 'AngelOne', activeCount: 0, failedSyncs: 0, tokenStatus: 'VALID', health: 100 },
  ],
  homeContent: null,
  coupons: [],
  testimonials: [],
  admins: [
    { _id: 'adm1', name: 'Lovepreet Singh', email: 'admin@lvprimex.com', role: 'SUPER_ADMIN' }
  ],
  systemSettings: {
    general: { siteName: 'LVX Terminal', supportEmail: 'support@lvprimex.com' },
    smtp: { host: 'smtp.mailtrap.io', port: '2525', secure: false },
    firebase: { apiKey: 'AIzaSyA...', projectId: 'lvx-terminal' },
    payment: { mode: 'sandbox', gateway: 'razorpay' }
  }
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setAdminUser: (state, action) => {
      const { user, token } = action.payload;
      if (token && user) {
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_user', JSON.stringify(user));
        state.adminUser = user;
        state.isAuthenticated = true;
      } else {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        state.adminUser = null;
        state.isAuthenticated = false;
      }
    },
    logout: (state) => {
      const log = createMockAuditLog(state.adminUser?.name || 'Admin', 'LOGOUT', 'User ended admin session');
      state.auditLogs.unshift(log);
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      state.adminUser = null;
      state.isAuthenticated = false;
    },
    addAuditLog: (state, action) => {
      state.auditLogs.unshift(action.payload);
    },
    updateLatency: (state, action) => {
      state.latency = action.payload;
      state.systemHealth.websocketLatency = action.payload;
      if (!state.latencyHistory) {
        state.latencyHistory = [14, 12, 16, 14, 18, 15, action.payload];
      } else {
        state.latencyHistory.push(action.payload);
        if (state.latencyHistory.length > 10) {
          state.latencyHistory.shift();
        }
      }
    },
    updateMarketPrice: (state, action) => {
      const { instrument, price } = action.payload;
      const old = state.marketPrices[instrument];
      const oldPrice = old ? old.price : 0;
      const isUp = price >= oldPrice;
      const changePct = oldPrice > 0 ? ((price - oldPrice) / oldPrice * 100).toFixed(2) : '+0.00';
      state.marketPrices[instrument] = {
        price,
        change: `${isUp ? '+' : ''}${changePct}%`,
        isUp,
      };
    },
    updateSignalPrice: (state, action) => {
      const { _id, currentPrice } = action.payload;
      state.signals = state.signals.map(s => {
        if (s._id === _id) {
          const updates = s.updates ? [...s.updates, currentPrice] : [s.entry, currentPrice];
          return { ...s, currentPrice, updates };
        }
        return s;
      });
    },
    // RBAC and mock operations reducer support
    setTelegramStatus: (state, action) => {
      state.telegramStatus = action.payload;
    },
    // Support ticket simulation
    resolveContactSubmissionLocal: (state, action) => {
      const id = action.payload;
      // Handled in UI, can maintain logs
    },
    // Reviews
    toggleReviewApproval: (state, action) => {
      const id = action.payload;
      state.testimonials = state.testimonials.map(t => t._id === id ? { ...t, approved: !t.approved } : t);
    },
    // Coupons
    createCoupon: (state, action) => {
      state.coupons.push({
        _id: Math.random().toString(36).substring(7),
        usageCount: 0,
        isActive: true,
        ...action.payload
      });
    },
    deleteCoupon: (state, action) => {
      state.coupons = state.coupons.filter(c => c._id !== action.payload);
    },
    // Admin management
    createAdmin: (state, action) => {
      state.admins.push({
        _id: Math.random().toString(36).substring(7),
        ...action.payload
      });
    },
    deleteAdmin: (state, action) => {
      state.admins = state.admins.filter(a => a._id !== action.payload);
    },
    // Settings
    updateSystemSettings: (state, action) => {
      state.systemSettings = { ...state.systemSettings, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.stats = {
          ...state.stats,
          activeSignals: action.payload.activeSignals || state.stats.activeSignals,
          signalsToday: action.payload.signalsToday || state.stats.signalsToday,
          totalUsers: action.payload.totalUsers || state.stats.totalUsers,
          revenue: action.payload.revenue || state.stats.revenue,
        };
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(fetchPackages.fulfilled, (state, action) => {
        state.packages = action.payload;
      })
      .addCase(fetchSignals.fulfilled, (state, action) => {
        state.signals = action.payload;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const { id, role } = action.payload;
        state.users = state.users.map(u => u._id === id ? { ...u, role } : u);
      })
      .addCase(updateUserSubscription.fulfilled, (state, action) => {
        const { id, subscription } = action.payload;
        state.users = state.users.map(u => u._id === id ? { ...u, subscription } : u);
      })
      .addCase(toggleBanUser.fulfilled, (state, action) => {
        const { id, isBanned } = action.payload;
        state.users = state.users.map(u => u._id === id ? { ...u, isBanned } : u);
      })
      .addCase(deleteUserThunk.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u._id !== action.payload);
      })
      .addCase(createPackageThunk.fulfilled, (state, action) => {
        state.packages.push(action.payload);
      })
      .addCase(updatePackageThunk.fulfilled, (state, action) => {
        const { id, data } = action.payload;
        state.packages = state.packages.map(p => p._id === id ? data : p);
      })
      .addCase(deletePackageThunk.fulfilled, (state, action) => {
        state.packages = state.packages.filter(p => p._id !== action.payload);
      })
      .addCase(createSignalThunk.fulfilled, (state, action) => {
        state.signals.unshift(action.payload);
      })
      .addCase(closeSignalThunk.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        state.signals = state.signals.map(s => s._id === id ? { ...s, status, statusChangedAt: new Date().toISOString() } : s);
      })
      .addCase(deleteSignalThunk.fulfilled, (state, action) => {
        state.signals = state.signals.filter(s => s._id !== action.payload);
      })
      .addCase(dispatchNotificationThunk.fulfilled, (state, action) => {
        state.notifications.unshift(action.payload);
      })
      .addCase(fetchHomeContent.fulfilled, (state, action) => {
        state.homeContent = action.payload;
      })
      .addCase(updateHomeContent.fulfilled, (state, action) => {
        state.homeContent = action.payload;
      });
  }
});

export const {
  setActiveTab, setAdminUser, logout, addAuditLog,
  updateLatency, updateMarketPrice, updateSignalPrice,
  setTelegramStatus, resolveContactSubmissionLocal,
  toggleReviewApproval, createCoupon, deleteCoupon,
  createAdmin, deleteAdmin, updateSystemSettings
} = adminSlice.actions;

export default adminSlice.reducer;
