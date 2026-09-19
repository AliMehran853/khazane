import { createBrowserRouter, Navigate } from 'react-router-dom';

import AppShell from '../components/layout/AppShell';

import HomePage from '../components/pages/HomePage';
import IncomePage from '../components/pages/IncomePage';
import ExpensesPage from '../components/pages/ExpensesPage';
import SettingsPage from '../components/pages/SettingsPage';
import SearchPage from '../components/pages/SearchPage';

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/income', element: <IncomePage /> },
      { path: '/expenses', element: <ExpensesPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/search', element: <SearchPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default router;