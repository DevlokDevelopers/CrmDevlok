import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const accessToken = localStorage.getItem("access_token");
  const role = localStorage.getItem("role"); // Assuming role is stored in localStorage (admin or sales_manager)

  const addNotification = (msg) => {
    setNotifications((prev) => {
      if (prev.includes(msg)) return prev;
      const updated = [msg, ...prev];
      localStorage.setItem("notifications", JSON.stringify(updated)); // Store notifications in localStorage for both roles
      return updated;
    });
  };

  const fetchReminders = async () => {
    try {
      if (role === "sales_manager") {
        // Sales Manager fetches followup reminders
        const res = await axios.get("https://devlokcrm-production.up.railway.app/followups/followup-reminders/", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        (res.data.notifications || []).forEach((n) => addNotification(n.message)); // Add sales manager-specific notifications
      } else if (role === "admin") {
        // Admin fetches task reminders
        const res = await axios.get("https://devlokcrm-production.up.railway.app/task/get_event_reminder/", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        (res.data.notifications || []).forEach((n) => addNotification(n.message)); // Add admin-specific notifications
      }
    } catch (err) {
      console.error("Reminder fetch error:", err);
    }
  };

  const setupWebSocket = () => {
    const wsList = [
      new WebSocket("wss://devlokcrm-production.up.railway.app/ws/notifications/"),
      new WebSocket("wss://devlokcrm-production.up.railway.app/ws/lead-notifications/"),
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
    setNotifications(JSON.parse(localStorage.getItem("notifications")) || []);
    fetchReminders();
    const cleanup = setupWebSocket();
    const interval = setInterval(fetchReminders, 300000); // Refresh reminders every 5 minutes
    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, [role]); // Re-run effect if role changes

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.setItem("notifications", JSON.stringify([])); // Clear all notifications for both roles
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
