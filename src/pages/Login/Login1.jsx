import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login1 = () => {
  const navigate = useNavigate();
  const { role } = useParams();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const { username, password } = formData;

    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const user = users.find(u => u.username === username && u.password === password && u.role === role);

      if (!user) {
        setError('Invalid username, password, or role.');
        return;
      }

      // Login user with role
      login({ username, role });
      navigate('/dashboard');
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your {role} account</p>
          <div className="role-badge">{role}</div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Signing in...
              </>
            ) : (
              <>
                <span>🔐</span>
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="auth-links">
          <span onClick={() => navigate('/forgot-password')} className="link">
            Forgot Password?
          </span>
          <span>
            Don't have an account?{' '}
            <span className="link" onClick={() => navigate(`/register/${role}`)}>
              Register here
            </span>
          </span>
          <span className="link" onClick={() => navigate('/')}>
            ← Back to Home
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login1;