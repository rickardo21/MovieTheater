import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import MainLayout from '../layouts/MainLayout';
import LoginPage from '../pages/LoginPage';
import { useAuth } from '../store/AuthContext';

const ProtectedRoute: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="h-screen w-full bg-[#1e1e1e] flex flex-col items-center justify-center text-white">
                <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4" />
                <span className="text-white/60 text-xs tracking-widest uppercase font-light">Caricamento...</span>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

/**
 * Application router.
 * Ogni route rappresenta una pagina principale dell'app.
 */
export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: '/',
            element: <Dashboard />,
          }
        ]
      }
    ]
  },
]);
