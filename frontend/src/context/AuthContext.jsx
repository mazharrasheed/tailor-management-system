// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('access_token'));


  useEffect(() => {
    const savedToken = localStorage.getItem('access_token');
    setToken(savedToken);
  }, []);

  const login = (newToken) => {
    localStorage.setItem('access_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
  };

  const [userPerms, setUserPerms] = useState({});
  useEffect(() => {
    fetchPermissions();
  }, [token]);

  const fetchPermissions = async () => {
    const response = await axios.get('https://anmoltailor.pythonanywhere.com/api/users/me/permissions/', {
      headers: { Authorization: `Token ${token}` },
    });
    setUserPerms(response.data.permissions);
    console.log(response.data.permissions)
    const perms=response.data.permissions
    perms.some(p => p.codename === "add_task")
  };

console.log("AuthContext userPerms:", userPerms);

  return (
    <AuthContext.Provider value={{ token, login, logout,userPerms }}>
      {children}
    </AuthContext.Provider>
  );
};
