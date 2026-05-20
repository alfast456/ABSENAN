import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

export const AuthContext = createContext();

export const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);

  const login = async (employeeCode, password) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        employee_code: employeeCode,
        password: password,
      });

      const { token, employee } = response.data;

      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('userData', JSON.stringify(employee));

      setUserToken(token);
      setUser(employee);
      return { success: true };
    } catch (error) {
      console.log('Login error:', error);
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // call logout API in backend
      if (userToken) {
        await axios.post(`${API_BASE_URL}/logout`, {}, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
      }
    } catch (error) {
      console.log('Logout API error:', error);
    } finally {
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userData');
      setUserToken(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      let token = await SecureStore.getItemAsync('userToken');
      let userData = await SecureStore.getItemAsync('userData');

      if (token && userData) {
        setUserToken(token);
        setUser(JSON.parse(userData));
      }
    } catch (e) {
      console.log('isLoggedIn error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider value={{ login, logout, isLoading, userToken, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
