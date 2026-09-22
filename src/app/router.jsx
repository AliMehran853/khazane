import { createBrowserRouter, Navigate } from 'react-router-dom';

import AppShell from '../components/layout/AppShell';

import HomePage from '../components/pages/HomePage';
import IncomePage from '../components/pages/IncomePage';
import ExpensesPage from '../components/pages/ExpensesPage';
import SettingsPage from '../components/pages/SettingsPage';
import SearchPage from '../components/pages/SearchPage';

import { ROUTES } from '../components/utils/constants';

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: ROUTES.home, element: <HomePage /> },
      { path: ROUTES.income, element: <IncomePage /> },
      { path: ROUTES.expenses, element: <ExpensesPage /> },
      { path: ROUTES.settings, element: <SettingsPage /> },
      { path: ROUTES.search, element: <SearchPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to={ROUTES.home} replace />,
  },
]);

export default router;