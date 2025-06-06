import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login1 = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    const { username, password } = formData;

    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      setError('Invalid username or password.');
      return;
    }

    localStorage.setItem('token', JSON.stringify({ username }));
    navigate('/dashboard');
  };

  return (
    <div className="login-container">
      <h2>Login to Your Account</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          autoComplete="username"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="current-password"
        />
        <button type="submit">Login</button>
      </form>

      {/* Forgot Password Link */}
      <p className="forgot-password">
        <span onClick={() => navigate('/forgot-password')} className="link">
          Forgot Password?
        </span>
      </p>

      <p>
        Don't have an account?{' '}
        <span className="link" onClick={() => navigate('/register')}>
          Register here
        </span>
      </p>
    </div>
  );
};

export default Login1;
