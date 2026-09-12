import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Provider } from 'react-redux';
import { store } from './redux/store.ts';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './layout/ProtectedRoute.tsx';
import { AppShell } from './components/AppShell.tsx';
import LoginPage from './components/Login.tsx';
import ActivatePage from './components/Activate.tsx';
import DashboardPage from "./components/DashboardPage";
import EmployeesPage from './components/EmployeesPage.tsx';
import EmployeeProfilePage from './components/EmployeeProfilePage.tsx';
import DepartmentsPage from './components/departments/DepartmentsPage.tsx';
import LeaveManagementPage from './components/leave/LeaveManagementPage.tsx';

const routes = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'employees', element: <EmployeesPage /> },
          { path: 'employees/:id', element: <EmployeeProfilePage /> },
          { path: 'departments', element: <DepartmentsPage /> },
          { path: 'leave', element: <LeaveManagementPage /> },
        ],
      },
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/activate', element: <ActivatePage /> },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={routes} />
    </Provider>
  </StrictMode>,
)
