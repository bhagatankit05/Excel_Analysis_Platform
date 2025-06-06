import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ForgotPassword from './Pages/ForgotPassword/ForgotPassword';

import Welcome from './Pages/Welcome/Welcome';
import Register from './Pages/Register/Register';
import Login1 from './Pages/Login/Login1';
import Dashboard from './Pages/Dashboard/Dashboard';
import Report from './Pages/Report/Report';
import Contact from './Pages/Contact/Contact';
import About from './Pages/About/About';

import Navbar from './Components/Navbar/Navbar';
import Footer from './Components/Footer/Footer';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Welcome />} />

        {/* Role-based Login & Register Routes */}
        <Route path="/register/:role" element={<Register />} />
        <Route path="/login/:role" element={<Login1 />} />

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

       <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
