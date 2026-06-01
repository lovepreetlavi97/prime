import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { getSocket, disconnectSocket } from './services/socket';
import { updateLatency, updateMarketPrice, updateSignalPrice } from './store/slices/adminSlice';

// Dynamic modules
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Subscribers from './pages/Subscribers';
import Subscriptions from './pages/Subscriptions';
import Transactions from './pages/Transactions';
import Signals from './pages/Signals';
import SignalAnalytics from './pages/SignalAnalytics';
import Notifications from './pages/Notifications';
import CMS from './pages/CMS';
import Support from './pages/Support';
import Reviews from './pages/Reviews';
import Coupons from './pages/Coupons';
import Admins from './pages/Admins';
import Settings from './pages/Settings';
import AuditLogs from './pages/AuditLogs';
import Login from './pages/Login';

// Additional modules present in current codebase
import Brokers from './pages/Brokers';
import Health from './pages/Health';

export const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.admin.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const LayoutShell = ({ children }) => {
  return (
    <div className="flex w-screen h-screen bg-[#03050C] text-[#F4F4F6] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-grow p-8 overflow-y-auto no-scrollbar relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.admin.isAuthenticated);

  // Setup real-time sockets telemetry
  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      return;
    }

    const socket = getSocket();
    let lastHeartbeat = Date.now();

    socket.on('connect', () => {
      dispatch(updateLatency(8));
    });

    socket.on('heartbeat', () => {
      const delay = Date.now() - lastHeartbeat;
      lastHeartbeat = Date.now();
      dispatch(updateLatency(Math.min(100, Math.max(2, Math.round(delay / 100)))));
    });

    socket.on('market_feed', (data) => {
      if (data && data.instrument) {
        dispatch(updateMarketPrice({ instrument: data.instrument, price: data.price }));
      }
    });

    socket.on('price_update', (data) => {
      if (data && data._id) {
        dispatch(updateSignalPrice({ _id: data._id, currentPrice: data.currentPrice }));
      }
    });

    socket.connect();

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, dispatch]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <LayoutShell>
              <Dashboard />
            </LayoutShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/signals"
        element={
          <ProtectedRoute>
            <LayoutShell>
              <Signals />
            </LayoutShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/signal-analytics"
        element={
          <ProtectedRoute>
            <LayoutShell>
              <SignalAnalytics />
            </LayoutShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <LayoutShell>
              <Users />
            </LayoutShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscribers"
        element={
          <ProtectedRoute>
            <LayoutShell>
              <Subscribers />
            </LayoutShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscriptions"
        element={
          <ProtectedRoute>
            <LayoutShell>
              <Subscriptions />
            </LayoutShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <LayoutShell>
              <Transactions />
            </LayoutShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/brokers"
        element={
          <ProtectedRoute>
            <LayoutShell>
              <Brokers />
            </LayoutShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <LayoutShell>
              <Notifications />
            </LayoutShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/contacts"
        element={
          <ProtectedRoute>
            <LayoutShell>
              <Support />
            </LayoutShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reviews"
        element={
          <ProtectedRoute>
            <LayoutShell>
              <Reviews />
            </LayoutShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/coupons"
        element={
          <ProtectedRoute>
            <LayoutShell>
              <Coupons />
            </LayoutShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/health"
        element={
          <ProtectedRoute>
            <LayoutShell>
              <Health />
            </LayoutShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admins"
        element={
          <ProtectedRoute>
            <LayoutShell>
              <Admins />
            </LayoutShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit-logs"
        element={
          <ProtectedRoute>
            <LayoutShell>
              <AuditLogs />
            </LayoutShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <LayoutShell>
              <Settings />
            </LayoutShell>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
