import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

const MOCK_USERS = {
  waiter: { id: 'w1', username: 'waiter', name: 'Rahul Sharma', role: 'waiter', title: 'Senior Staff Waiter' },
  chef: { id: 'c1', username: 'chef', name: 'Chef Sanjeev', role: 'chef', title: 'Head Executive Chef' },
  owner: { id: 'o1', username: 'owner', name: 'Vikramaditya Roy', role: 'owner', title: 'Hotel Owner & Manager' }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('hotel_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (role, customName = '') => {
    const baseUser = MOCK_USERS[role] || MOCK_USERS.waiter;
    const savedName = localStorage.getItem(`hotel_user_name_${role}`);
    const nameToUse = customName.trim() || savedName || baseUser.name;

    const userData = {
      ...baseUser,
      name: nameToUse
    };

    setUser(userData);
    localStorage.setItem('hotel_user', JSON.stringify(userData));
    localStorage.setItem(`hotel_user_name_${role}`, nameToUse);
  };

  const updateUserName = (newName) => {
    if (!user || !newName.trim()) return;
    const trimmedName = newName.trim();
    const updatedUser = { ...user, name: trimmedName };
    setUser(updatedUser);
    localStorage.setItem('hotel_user', JSON.stringify(updatedUser));
    localStorage.setItem(`hotel_user_name_${user.role}`, trimmedName);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hotel_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserName, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
