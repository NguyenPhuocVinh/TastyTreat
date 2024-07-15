import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './login.scss';
import { BASE_URL } from '../../utils/Config';

const Login = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!userName || !password) {
      setErrorMessage('Username and password are required');
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        userName,
        password,
      });

      const { accessToken, refreshToken } = response.data.Token;

      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('refreshToken', refreshToken);

      // Navigate to home page
      navigate('/home');
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage(error.response?.data?.message || 'An error occurred during login. Please try again.');
    }
  };

  return (
    <div className="login">
      <div className="login-container">
        <h2>Login</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <input 
          type="text" 
          placeholder="Username"
          value={userName}
          onChange={(e) => setUserName(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Đăng nhập</button>
      </div>
    </div>
  );
}

export default Login;
