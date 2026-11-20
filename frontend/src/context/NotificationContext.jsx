import React, { createContext, useState, useCallback } from "react";
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback((type, message, title = null, duration = 5000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    const newNotif = { id, type, message, title };

    setNotifications((prev) => [...prev, newNotif]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    return id;
  }, [removeNotification]);

  const notifySuccess = useCallback((message, title = "Succès") => {
    return addNotification("success", message, title);
  }, [addNotification]);

  const notifyError = useCallback((message, title = "Erreur") => {
    return addNotification("danger", message, title, 7000);
  }, [addNotification]);

  const notifyInfo = useCallback((message, title = "Information") => {
    return addNotification("info", message, title);
  }, [addNotification]);

  const notifyWarning = useCallback((message, title = "Attention") => {
    return addNotification("warning", message, title, 6000);
  }, [addNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifySuccess,
        notifyError,
        notifyInfo,
        notifyWarning,
        removeNotification,
      }}
    >
      {children}
      {/* Container Toast Notifications */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxWidth: "420px",
          width: "90%",
          pointerEvents: "none",
        }}
      >
        {notifications.map((n) => {
          const icons = {
            success: CheckCircle,
            danger: AlertCircle,
            warning: AlertTriangle,
            info: Info,
          };
          const IconComponent = icons[n.type] || Info;

          return (
            <div
              key={n.id}
              className={`alert alert-${n.type}`}
              style={{
                pointerEvents: "auto",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                margin: 0,
                animation: "slideInRight 0.25s ease-out",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
              }}
            >
              <IconComponent size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
              <div style={{ flex: 1, fontSize: "0.875rem" }}>
                {n.title && <div style={{ fontWeight: 700, marginBottom: "2px" }}>{n.title}</div>}
                <div>{n.message}</div>
              </div>
              <button
                onClick={() => removeNotification(n.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "inherit",
                  opacity: 0.7,
                  padding: "2px",
                  display: "flex",
                }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
}
