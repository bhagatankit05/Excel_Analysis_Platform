import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

const Welcome = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(null); // null means no role selected yet

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
  };

  return (
    <div className="welcome-container">
      <h1>Welcome to Excel Analyzer</h1>
      <p>Transform your Excel data into visual insights instantly.</p>

      {!role ? (
        <div className="role-selection">
          <h2>Select Your Role</h2>
          <button onClick={() => handleRoleSelect('admin')}>Admin</button>
          <button onClick={() => handleRoleSelect('user')}>User</button>
        </div>
      ) : (
        <div className="welcome-buttons">
          <p>You selected: <strong>{role.toUpperCase()}</strong></p>
          <button onClick={() => navigate(`/register/${role}`)}>Create Account</button>
          <button onClick={() => navigate(`/login/${role}`)}>Login</button>
          <button onClick={() => setRole(null)}>Change Role</button> {/* Optional to go back */}
        </div>
      )}
    </div>
  );
};

export default Welcome;
