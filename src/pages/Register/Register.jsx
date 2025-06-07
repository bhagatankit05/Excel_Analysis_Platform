import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { role } = useParams();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const { username, email, password, confirmPassword } = formData;

    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let users = JSON.parse(localStorage.getItem('users')) || [];
      
      if (users.find(u => u.username === username)) {
        setError('Username already exists.');
        return;
      }
      
      if (users.find(u => u.email === email)) {
        setError('Email already exists.');
        return;
      }

      users.push({ 
        username, 
        email, 
        password, 
        role,
        createdAt: new Date().toISOString()
      });
      
      localStorage.setItem('users', JSON.stringify(users));
      
      alert('Registration successful! Please login.');
      navigate(`/login/${role}`);
    } catch (error) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join as a {role}</p>
          <div className="role-badge">{role}</div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              autoComplete="off"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Creating Account...
              </>
            ) : (
              <>
                <span>🚀</span>
                Create Account
              </>
            )}
          </button>
        </form>

        <div className="auth-links">
          <span>
            Already have an account?{' '}
            <span className="link" onClick={() => navigate(`/login/${role}`)}>
              Login here
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

export default Register;