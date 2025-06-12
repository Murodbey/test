import React, { createContext, useState } from 'react';

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Or useState(localStorage.getItem('token')) if you store token

  const login = (userData) => {
    // In a real app, you'd likely store a token here
    setUser(userData);
    // Optional: store token/user data in local storage
    // localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    // Optional: remove token/user data from local storage
    // localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };