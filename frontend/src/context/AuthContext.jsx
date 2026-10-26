import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('brandsutra_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('brandsutra_token');
      const storedUser = localStorage.getItem('brandsutra_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Refresh user data from backend
          const res = await authService.getMe();
          setUser(res.data);
          localStorage.setItem('brandsutra_user', JSON.stringify(res.data));
        } catch (err) {
          console.error("Auth validation failed:", err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const { token: jwtToken, user: userData } = res.data;
    
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('brandsutra_token', jwtToken);
    localStorage.setItem('brandsutra_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    const { token: jwtToken, user: userData } = res.data;
    
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('brandsutra_token', jwtToken);
    localStorage.setItem('brandsutra_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('brandsutra_token');
    localStorage.removeItem('brandsutra_user');
  };

  // Demo user switcher for hackathon evaluation
  const switchDemoAccount = async (roleName) => {
    let email = 'admin@novahome.com';
    let pass = 'Admin@123';

    if (roleName === 'CONTENT_CREATOR') {
      email = 'creator@novahome.com';
      pass = 'Creator@123';
    } else if (roleName === 'REVIEWER') {
      email = 'reviewer@novahome.com';
      pass = 'Reviewer@123';
    }

    return await login(email, pass);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    switchDemoAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
