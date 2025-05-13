import React from 'react';
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary, DefaultErrorElement } from './components/ErrorBoundary';
import Layout from './components/Layout';
import Login from './pages/Login';
import Create from './pages/Create';
import View from './pages/View';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <DefaultErrorElement />,
    children: [
      {
        index: true,
        element: <ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>
      },
      {
        path: 'login',
        element: <Login />,
        errorElement: <DefaultErrorElement />
      },
      {
        path: 'create',
        element: (
          <ProtectedRoute>
            <ErrorBoundary>
              <Create />
            </ErrorBoundary>
          </ProtectedRoute>
        ),
        errorElement: <DefaultErrorElement />
      },
      {
        path: 'view/:id',
        element: <View />,
        errorElement: <DefaultErrorElement />
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <ErrorBoundary>
              <Dashboard />
            </ErrorBoundary>
          </ProtectedRoute>
        ),
        errorElement: <DefaultErrorElement />
      }
    ]
  }
]);

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;