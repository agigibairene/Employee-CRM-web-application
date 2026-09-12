import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx';
import { Provider } from 'react-redux';
import { store } from './redux/store.ts';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LoginPage from './components/Login.tsx';
import ActivatePage from './components/Activate.tsx';
import DashboardPage from "./components/DashboardPage";


const routes  = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />
      }
    ]
  },
  { path: '/login', element: <LoginPage />},
  {path: '/activate', element: <ActivatePage />}
])



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={routes} />
    </Provider>
  </StrictMode>,
)
