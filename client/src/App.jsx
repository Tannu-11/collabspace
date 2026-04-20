import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectBoard from './pages/ProjectBoard';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#ffffff',
            color: '#1a1915',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '12px',
            padding: '10px 16px',
            fontSize: '13px',
            fontFamily: 'DM Sans, sans-serif',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.06)',
            fontWeight: '500',
          },
          success: {
            iconTheme: { primary: '#16a34a', secondary: '#fff' },
            style: { borderColor: 'rgba(22,163,74,0.2)', borderLeft: '3px solid #16a34a' },
          },
          error: {
            iconTheme: { primary: '#dc2626', secondary: '#fff' },
            style: { borderColor: 'rgba(220,38,38,0.2)', borderLeft: '3px solid #dc2626' },
          },
        }}
      />
      <Routes>
        <Route path="/login"       element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register"    element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/"            element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/project/:id" element={<PrivateRoute><ProjectBoard /></PrivateRoute>} />
        <Route path="*"            element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}