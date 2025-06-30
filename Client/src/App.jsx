import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Layout from './Components/Layout/Layout';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';

/* ---------- Pages ---------- */
import Welcome        from './Pages/Welcome/Welcome';
import UploadExcel    from './Pages/UploadExcel/UploadExcel';
import Register       from './Pages/Register/Register';
import Login1         from './Pages/Login/Login1';
import Dashboard      from './Pages/Dashboard/Dashboard';
import Report         from './Pages/Report/Report';
import Contact        from './Pages/Contact/Contact';
import About          from './Pages/About/About';
import ForgotPassword from './Pages/ForgotPassword/ForgotPassword';
import AIInsights     from './Pages/AIInsights/AIInsights';
import Settings       from './Pages/Settings/Settings';
import DeepAnalysis   from './Pages/DeepAnalysis/DeepAnalysis';
import ActivityLog    from './Pages/ActivityLog/ActivityLog';
import UserManagement from './Pages/UserManagement/UserManagement';  

import './App.css';

function AppContent() {
  const { user } = useAuth();

  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public */}
          <Route path="/"               element={user ? <Dashboard /> : <Welcome />} />
          <Route path="/register/:role" element={<Register />} />
          <Route path="/login/:role"    element={<Login1 />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected */}
          <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/upload"      element={<ProtectedRoute><UploadExcel /></ProtectedRoute>} />
          <Route path="/reports"     element={<ProtectedRoute><Report /></ProtectedRoute>} />
          <Route path="/ai-insights" element={<ProtectedRoute><AIInsights /></ProtectedRoute>} />
          <Route path="/analyze"     element={<ProtectedRoute><DeepAnalysis /></ProtectedRoute>} />
          <Route path="/activity-log"element={<ProtectedRoute><ActivityLog /></ProtectedRoute>} />
          <Route path="/settings"    element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/contact"     element={<ProtectedRoute><Contact /></ProtectedRoute>} />
          <Route path="/about"       element={<ProtectedRoute><About /></ProtectedRoute>} />

          {/* NEW: User Management */}
          <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />

          {/* Legacy redirects */}
          <Route path="/login"    element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
