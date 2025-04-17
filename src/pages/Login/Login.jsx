import React, { useState } from 'react';
import axios from 'axios';
import styles from './Login.module.css';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Reset error before new attempt

    try {
      console.log('Attempting login with:', { email, password }); // Log email and password

      const response = await axios.post(
        'https://devlokcrm-production.up.railway.app/auth/login/', // Your login endpoint
        { email, password }
      );

      console.log('Response Data:', response.data); // Log the response data from server

      const { message, access_token, refresh_token } = response.data;

      // If successful, store JWT tokens in localStorage
      if (access_token && refresh_token) {
        localStorage.setItem('access_token', access_token); // Store access token
        localStorage.setItem('refresh_token', refresh_token); // Store refresh token
      }

      if (message === 'Admin successfully logged in') {
        console.log('Redirecting to Admin Dashboard...');
        navigate('/adminDash'); // ✅ Ensure the redirection works
      } 
      else if (message === 'Sales Manager successfully logged in') {
        console.log('Redirecting to Sales Dashboard...');
        navigate('/salesmanagerDashboard');
      } 
      else {
        setError('Invalid login credentials');
      }
    } catch (err) {
      console.error('Login Error:', err.response?.data || err); // Log error response
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.body}>
      <div className={styles.container}>
        <div className={styles.left}>
          <h1>DEVLOK</h1>
          <p>DEVELOPERS</p>
        </div>
        <div className={styles.right}>
          <div className={styles.loginbox}>
            <h2>Login</h2>
            {error && <p className={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className={styles.inputgroup}>
                <label>Email</label>
                <input
                  type="email"
                  placeholder="username@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className={styles.inputgroup}>
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Link to="/forgotpassword" className={styles.forgotpassword}>
                Forgot Password?
              </Link>

              <button type="submit" className={styles.btn} disabled={loading}>
                {loading ? <span className={styles.loader}></span> : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
