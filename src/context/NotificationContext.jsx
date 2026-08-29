import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addNotification = ({ title, message, type = 'info', actionButton = null }) => {
    const id = Date.now() + Math.random().toString();
    const newToast = { id, title, message, type, actionButton, createdAt: new Date() };
    
    setToasts((prev) => [newToast, ...prev]);

    // Auto remove after 7 seconds unless it's a priority notification
    setTimeout(() => {
      removeNotification(id);
    }, 7000);
  };

  const removeNotification = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ toasts, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
