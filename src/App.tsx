import { RouterProvider } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import { router } from './routes';

// v3.0 - Full Routing System with React Router - Updated 2026-04-22
export default function App() {
  return (
    <UIProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </UIProvider>
  );
}
