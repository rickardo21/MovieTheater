import { createBrowserRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import MainLayout from '../layouts/MainLayout';

/**
 * Application router.
 * Ogni route rappresenta una pagina principale dell'app.
 */
export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <Dashboard />,
      }
    ]
  },
]);
