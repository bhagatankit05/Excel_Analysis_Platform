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
  const [showPassword, setShowPassword] = useState(false);

  const validatePassword = (password) => {
    const minLength = 6; // Reduced from 8 for easier testing

    if (password.length < minLength) {
      return 'Password must be at least 6 characters long';
    }
    return null; // Simplified validation for easier testing
  };

  const validateUsername = (username) => {
    const minLength = 3;
    const maxLength = 20;

    if (username.length < minLength) {
      return 'Username must be at least 3 characters long';
    }
    if (username.length > maxLength) {
      return 'Username cannot exceed 20 characters';
    }
    return null;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = formData;

    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    const usernameError = validateUsername(username);
    if (usernameError) {
      setError(usernameError);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login({ username, password, role });

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Invalid username, password, or role.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.log(err.message)
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
            <div className="input-container">
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
                disabled={loading}
                className="form-input"
              />
            </div>
            <small className="input-hint">3-20 characters</small>
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <div className="input-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                disabled={loading}
                className="form-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <small className="input-hint">Minimum 6 characters</small>
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

        {/* Demo credentials info */}
        <div className="demo-info">
          <h4>Demo Credentials:</h4>
          <p><strong>Admin:</strong> admin / admin123</p>
          <p><strong>User:</strong> user / user123</p>
        </div>
      </div>
    </div>
  );
};

export default Login1;