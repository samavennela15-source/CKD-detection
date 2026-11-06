import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const savedToken = localStorage.getItem('ckd_token');
    const savedUser = localStorage.getItem('ckd_user');
    const savedRole = localStorage.getItem('ckd_role');
    return {
      token: savedToken || null,
      user: savedUser ? JSON.parse(savedUser) : null,
      role: savedRole || null
    };
  });

  const login = (data, role) => {
    localStorage.setItem('ckd_token', data.token);
    const userObj = data.patient || data.doctor || data.admin || { email: data.email };
    localStorage.setItem('ckd_user', JSON.stringify(userObj));
    localStorage.setItem('ckd_role', role);
    setAuth({ token: data.token, user: userObj, role });
  };

  const logout = () => {
    localStorage.removeItem('ckd_token');
    localStorage.removeItem('ckd_user');
    localStorage.removeItem('ckd_role');
    setAuth({ token: null, user: null, role: null });
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
