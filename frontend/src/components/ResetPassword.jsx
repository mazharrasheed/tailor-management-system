import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams();   // get token from URL
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post(
        `https://anmoltailor.pythonanywhere.com/api/reset-password/${token}/`,
        { new_password: newPassword }
      );
      setMessage(response.data.message || "Password reset successful!");
      // redirect to login after success
      setTimeout(() => navigate('/signin'), 2000);
    } catch (err) {
      setError("Failed to reset password. Token may be invalid or expired.");
    }
  };

  return (
    <div className="container p-5">
      <h2>Reset Password</h2>
      <form onSubmit={handleReset}>
        <div>
          <label className="form-label">New Password:</label>
          <input
            type="password"
            className="form-control"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <br />
        <div>
          <label className="form-label">Confirm Password:</label>
          <input
            type="password"
            className="form-control"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <br />
        <button className="btn btn-primary" type="submit">Reset Password</button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default ResetPassword;
