import { createBrowserRouter, Navigate } from 'react-router';
import { LoginPage } from './pages/LoginPage';
import { CharacterPage } from './pages/CharacterPage';
import { AdminPage } from './pages/AdminPage';
import { AdminItemsPage } from './pages/AdminItemsPage';
import { AdminShopsPage } from './pages/AdminShopsPage';
import { ShopPage } from './pages/ShopPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedRoute } from './components/ui/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/character',
    element: (
      <ProtectedRoute>
        <CharacterPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/shop',
    element: (
      <ProtectedRoute>
        <ShopPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requireAdmin>
        <AdminPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/items',
    element: (
      <ProtectedRoute requireAdmin>
        <AdminItemsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/shops',
    element: (
      <ProtectedRoute requireAdmin>
        <AdminShopsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
