import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: enter username/email, 2: security question, 3: reset password
  const [formData, setFormData] = useState({
    identifier: '', // username or email
    securityAnswer: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userFound, setUserFound] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const securityQuestions = [
    "What was the name of your first pet?",
    "What city were you born in?",
    "What is your mother's maiden name?",
    "What was your first car?",
    "What elementary school did you attend?"
  ];

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    let strength = 0;
    if (password.length >= minLength) strength++;
    if (hasUpperCase) strength++;
    if (hasLowerCase) strength++;
    if (hasNumbers) strength++;
    if (hasSpecialChar) strength++;

    return { strength, isValid: strength === 5 };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (error) setError('');

    if (name === 'newPassword') {
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

  // Step 1: Verify user exists
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => 
      u.username === formData.identifier || u.email === formData.identifier
    );

    if (!formData.identifier) {
      setError('Please enter your username or email.');
      setLoading(false);
      return;
    }
    
    if (!user) {
      setError('User not found. Please check your username or email.');
      setLoading(false);
      return;
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setUserFound(user);
    setError('');
    setStep(2);
    setLoading(false);
  };

  // Step 2: Verify security question (simulated)
  const handleSecurityVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.securityAnswer) {
      setError('Please answer the security question.');
      setLoading(false);
      return;
    }

    // Simulate security verification
    await new Promise(resolve => setTimeout(resolve, 1500));

    // For demo purposes, accept any answer
    if (formData.securityAnswer.length < 2) {
      setError('Security answer is too short.');
      setLoading(false);
      return;
    }

    setError('');
    setStep(3);
    setLoading(false);
  };

  // Step 3: Reset password
  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    const passwordValidation = validatePassword(formData.newPassword);
    if (!passwordValidation.isValid) {
      setError('Password must be at least 8 characters with uppercase, lowercase, number, and special character.');
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const updatedUsers = users.map(user => {
      if (user.username === userFound.username) {
        return { ...user, password: formData.newPassword };
      }
      return user;
    });
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    setLoading(false);
    alert('Password updated successfully! Please login with your new password.');
    navigate(`/login/${userFound.role}`);
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-header">
          <div className="forgot-icon">🔐</div>
          <h2>Reset Your Password</h2>
          <p>We'll help you get back into your account</p>
        </div>

        <div className="progress-indicator">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <span>Verify Identity</span>
          </div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <span>Security Check</span>
          </div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span>New Password</span>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {step === 1 && (
          <form onSubmit={handleVerify} className="forgot-form">
            <div className="form-group">
              <label>Username or Email</label>
              <input
                type="text"
                name="identifier"
                placeholder="Enter your username or email"
                value={formData.identifier}
                onChange={handleChange}
                disabled={loading}
              />
              <small className="input-hint">We'll use this to find your account</small>
            </div>
            
            <button type="submit" className="forgot-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Verifying...
                </>
              ) : (
                <>
                  <span>🔍</span>
                  Find Account
                </>
              )}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSecurityVerify} className="forgot-form">
            <div className="user-info-forgotPassword">
              <div className="user-avatar">
                {userFound?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4>{userFound?.username}</h4>
                <p>{userFound?.email}</p>
              </div>
            </div>

            <div className="form-group">
              <label>Security Question</label>
              <div className="security-question">
                {securityQuestions[Math.floor(Math.random() * securityQuestions.length)]}
              </div>
              <input
                type="text"
                name="securityAnswer"
                placeholder="Enter your answer"
                value={formData.securityAnswer}
                onChange={handleChange}
                disabled={loading}
              />
              <small className="input-hint">This helps us verify your identity</small>
            </div>
            
            <button type="submit" className="forgot-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Verifying...
                </>
              ) : (
                <>
                  <span>✓</span>
                  Verify Answer
                </>
              )}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleReset} className="forgot-form">
            <div className="success-message">
              <span>✅</span>
              Identity verified! Now create a new password.
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                placeholder="Create a strong password"
                value={formData.newPassword}
                onChange={handleChange}
                disabled={loading}
              />
              {formData.newPassword && (
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
              <small className="input-hint">8+ characters with uppercase, lowercase, number, and special character</small>
            </div>
            
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
              {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                <small className="error-hint">Passwords do not match</small>
              )}
            </div>
            
            <button type="submit" className="forgot-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Updating Password...
                </>
              ) : (
                <>
                  <span>🔒</span>
                  Update Password
                </>
              )}
            </button>
          </form>
        )}

        <div className="forgot-footer">
          <span className="link" onClick={() => navigate('/')}>
            ← Back to Home
          </span>
          {step > 1 && (
            <span className="link" onClick={() => setStep(step - 1)}>
              ← Previous Step
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;