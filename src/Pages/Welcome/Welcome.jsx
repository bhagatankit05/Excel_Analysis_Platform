import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <h1>Welcome to Excel Analyzer</h1>
      <p>Transform your Excel data into visual insights instantly.</p>
      <div className="welcome-buttons">
        <button onClick={() => navigate('/register')}>Create Account</button>
        <button onClick={() => navigate('/login')}>Login</button>
      </div>
    </div>
  );
};

export default Welcome;
