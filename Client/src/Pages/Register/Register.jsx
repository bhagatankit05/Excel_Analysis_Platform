import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Register.css';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
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
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (password) => {
    const minLength = 6; // Reduced for easier testing
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    let strength = 0;
    let errors = [];

    if (password.length >= minLength) strength++;
    else errors.push('At least 6 characters');

    if (hasUpperCase) strength++;
    else errors.push('One uppercase letter');

    if (hasLowerCase) strength++;
    else errors.push('One lowercase letter');

    if (hasNumbers) strength++;
    else errors.push('One number');

    if (hasSpecialChar) strength++;
    else errors.push('One special character');

    return { strength, errors, isValid: strength >= 3 }; // Reduced requirement
  };

  const validateUsername = (username) => {
    const minLength = 3;
    const maxLength = 20;
    const validPattern = /^[a-zA-Z0-9_]+$/;

    if (username.length < minLength) {
      return 'Username must be at least 3 characters long';
    }
    if (username.length > maxLength) {
      return 'Username cannot exceed 20 characters';
    }
    if (!validPattern.test(username)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return null;
  };

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user starts typing
    if (error) setError('');

    // Update password strength
    if (name === 'password') {
      const { strength } = validatePassword(value);
      setPasswordStrength(strength);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return '#f5576c';
    if (passwordStrength <= 3) return '#feca57';
    if (passwordStrength <= 4) return '#48bb78';
    return '#667eea';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Very Weak';
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Fair';
    if (passwordStrength <= 4) return 'Good';
    return 'Strong';
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const { username, email, password, confirmPassword } = formData;

    console.log(username);
    console.log(email);
    console.log(password);
    console.log(confirmPassword);

    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    // Validate username
    const usernameError = validateUsername(username);
    if (usernameError) {
      setError(usernameError);
      return;
    }

    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(`Password requirements: ${passwordValidation.errors.join(', ')}`);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userData = {
        username,
        email,
        password,
        confirmPassword,
        role,
      };

      const res = await register(userData);

      // Assuming register() returns a response with `success` or `status` or `data`
      if (res?.success || res?.status === 200 || res?.data) {
        alert('Registration successful! Please login.');
        navigate(`/login/${role}`);
      } else {
        throw new Error(res.message);
      }

    } catch (error) {
      setError(`${error.message}`);
      console.error(error);
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
            <div className="input-container">
              <input
                type="text"
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                autoComplete="off"
                disabled={loading}
                className="form-input"
              />
            </div>
            <small className="input-hint">3-20 characters, letters, numbers, and underscores only</small>
          </div>

          <div className="form-group">
            <label>Email</label>
            <div className="input-container">
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                disabled={loading}
                className="form-input"
              />
            </div>
            <small className="input-hint">We'll use this for account recovery</small>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
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
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div
                    className="strength-fill"
                    style={{
                      width: `${(passwordStrength / 5) * 100}%`,
                      backgroundColor: getPasswordStrengthColor()
                    }}
                  ></div>
                </div>
                <small className="strength-text" style={{ color: getPasswordStrengthColor() }}>
                  {getPasswordStrengthText()}
                </small>
              </div>
            )}
            <small className="input-hint">6+ characters with uppercase, lowercase, and number</small>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div className="input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={loading}
                className="form-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <small className="error-hint">Passwords do not match</small>
            )}
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

        {/* Demo info */}
        <div className="demo-info">
          <h4>Quick Test:</h4>
          <p>Try: testuser / test@email.com / Test123!</p>
        </div>
      </div>
    </div>
  );
};

export default Register;