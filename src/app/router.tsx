import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { OverviewPage } from '../pages/OverviewPage';
import { ProcessesPage } from '../pages/ProcessesPage';
import { PerformancePage } from '../pages/PerformancePage';
import { StoragePage } from '../pages/StoragePage';
import { NetworkPage } from '../pages/NetworkPage';
import { SettingsPage } from '../pages/SettingsPage';
import { DeviceDiscoveryPage } from '../pages/DeviceDiscoveryPage';
import { LoginPage } from '../pages/LoginPage';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/discover',
    element: <DeviceDiscoveryPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <OverviewPage />,
      },
      {
        path: 'processes',
        element: <ProcessesPage />,
      },
      {
        path: 'performance',
        element: <PerformancePage />,
      },
      {
        path: 'storage',
        element: <StoragePage />,
      },
      {
        path: 'network',
        element: <NetworkPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
