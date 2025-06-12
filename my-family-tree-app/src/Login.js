import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || ''; // Assuming you have a BASE_URL environment variable

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/login`, { // Assuming '/login' is your API endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      // Assuming successful login returns user data or a token
      const userData = await response.json(); // You might receive user info or a token here
      // TODO: Handle successful login - e.g., store token/user info in local storage or context
      console.log('Login successful:', userData); // Placeholder for handling login success

      setLoading(false);
      navigate('/dashboard'); // Navigate to dashboard on successful login

    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}

export default Login;
