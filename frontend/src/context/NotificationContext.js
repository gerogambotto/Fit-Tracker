import React, { createContext, useContext, useState } from 'react';
import SuccessMessage from '../components/SuccessMessage';
import ErrorMessage from '../components/ErrorMessage';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (type, message, duration = 5000) => {
    const id = Date.now();
    const notification = { id, type, message, duration };
    
    setNotifications(prev => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const showSuccess = (message, duration) => addNotification('success', message, duration);
  const showError = (message, duration) => addNotification('error', message, duration);

  const value = {
    showSuccess,
    showError,
    removeNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div key={notification.id} className="max-w-sm">
            {notification.type === 'success' ? (
              <SuccessMessage 
                message={notification.message}
                onClose={() => removeNotification(notification.id)}
                autoClose={false}
              />
            ) : (
              <ErrorMessage 
                message={notification.message}
                onRetry={() => removeNotification(notification.id)}
              />
            )}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};