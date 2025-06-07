import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';

// Pages
import Welcome from './Pages/Welcome/Welcome';
import Register from './Pages/Register/Register';
import Login1 from './Pages/Login/Login1';
import Dashboard from './pages/Dashboard/Dashboard';
import UploadExcel from './pages/UploadExcel/UploadExcel';
import Report from './Pages/Report/Report';
import Contact from './Pages/Contact/Contact';
import About from './Pages/About/About';
import ForgotPassword from './Pages/ForgotPassword/ForgotPassword';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Welcome />} />
            <Route path="/register/:role" element={<Register />} />
            <Route path="/login/:role" element={<Login1 />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/upload" 
              element={
                <ProtectedRoute>
                  <UploadExcel />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Report />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contact"
              element={
                <ProtectedRoute>
                  <Contact />
                </ProtectedRoute>
              }
            />
            <Route
              path="/about"
              element={
                <ProtectedRoute>
                  <About />
                </ProtectedRoute>
              }
            />

            {/* Redirect old routes */}
            <Route path="/login" element={<Navigate to="/\" replace />} />
            <Route path="/register" element={<Navigate to="/\" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;