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

function App() {
  return (
    <BrowserRouter>

      {/* Global Toast Notifications */}
      <Toaster
        position="top-right"
        gutter={10}
        toastOptions={{
  duration: 3500,
  style: {
    background: '#111',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '12px 18px',
    fontSize: '14px',
    fontFamily: 'Outfit, sans-serif',
    boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
  },
  success: {
    iconTheme: { primary: '#f5c518', secondary: '#111' },
    style: { border: '1px solid rgba(245,197,24,0.2)' },
  },
  error: {
    iconTheme: { primary: '#ff4d4d', secondary: '#111' },
    style: { border: '1px solid rgba(255,77,77,0.2)' },
  },
}}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Protected Routes */}
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/project/:id" element={<PrivateRoute><ProjectBoard /></PrivateRoute>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;