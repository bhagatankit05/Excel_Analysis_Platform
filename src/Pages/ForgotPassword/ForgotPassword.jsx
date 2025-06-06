import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: enter username, 2: reset password
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 1: verify user exists
  const handleVerify = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userExists = users.some(u => u.username === username);

    if (!username) {
      setError('Please enter your username.');
      return;
    }
    if (!userExists) {
      setError('User not found.');
      return;
    }
    setError('');
    setStep(2);
  };

  // Step 2: reset password
  const handleReset = (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const updatedUsers = users.map(user => {
      if (user.username === username) {
        return { ...user, password: newPassword };
      }
      return user;
    });
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    alert('Password updated successfully! Please login with your new password.');
    navigate('/login');
  };

  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>

      {error && <p className="error">{error}</p>}

      {step === 1 && (
        <form onSubmit={handleVerify} className="forgot-password-form">
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <button type="submit">Verify</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleReset} className="forgot-password-form">
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
          <button type="submit">Reset Password</button>
        </form>
      )}

      <p className="back-to-login" onClick={() => navigate('/login')}>
        Back to Login
      </p>
    </div>
  );
};

export default ForgotPassword;
