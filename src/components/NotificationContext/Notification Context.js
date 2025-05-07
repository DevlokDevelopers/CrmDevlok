import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const accessToken = localStorage.getItem("access_token");

  const addNotification = (msg) => {
    setNotifications((prev) => {
      if (prev.includes(msg)) return prev;
      const updated = [msg, ...prev];
      localStorage.setItem("admin_notifications", JSON.stringify(updated));
      return updated;
    });
  };

  const fetchReminders = async () => {
    try {
      const res = await axios.get("https://devlokcrmbackend.up.railway.app/task/get_event_reminder/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      (res.data.notifications || []).forEach((n) => addNotification(n.message));
    } catch (err) {
      console.error("Reminder fetch error:", err);
    }
  };

  const setupWebSocket = () => {
    const wsList = [
      new WebSocket("wss://devlokcrmbackend.up.railway.app/ws/notifications/"),
      new WebSocket("wss://devlokcrmbackend.up.railway.app/ws/lead-notifications/")
    ];

    wsList.forEach((ws) => {
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          addNotification(data.message || data.notification || "New notification");
        } catch (err) {
          console.error("WS message error:", err);
        }
      };
      ws.onerror = console.error;
      ws.onclose = () => setTimeout(setupWebSocket, 5000); // Reconnect
    });

    return () => wsList.forEach(ws => ws.close());
  };

  useEffect(() => {
    setNotifications(JSON.parse(localStorage.getItem("admin_notifications")) || []);
    fetchReminders();
    const cleanup = setupWebSocket();
    const interval = setInterval(fetchReminders, 300000);
    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, []);

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.setItem("admin_notifications", JSON.stringify([]));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
