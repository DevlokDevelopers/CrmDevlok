import { createContext, useContext, useEffect, useRef, useState } from "react";
import axios from "axios";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const notificationSocketRef = useRef(null);
  const leadNotificationSocketRef = useRef(null);
  const intervalRef = useRef(null);
  const accessToken = localStorage.getItem("access_token");
  const role = localStorage.getItem("role");

  const addNotification = (msg) => {
    setNotifications((prev) => {
      if (prev.includes(msg)) return prev;
      const updated = [msg, ...prev];
      localStorage.setItem("notifications", JSON.stringify(updated));
      return updated;
    });
  };

  const fetchReminders = async () => {
    try {
      const url =
        role === "sales_manager"
          ? "https://devlokcrm-production.up.railway.app/followups/followup-reminders/"
          : "https://devlokcrm-production.up.railway.app/task/get_event_reminder/";

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      (res.data.notifications || []).forEach((n) => addNotification(n.message));
    } catch (err) {
      console.error("Reminder fetch error:", err);
    }
  };

  useEffect(() => {
    setNotifications(JSON.parse(localStorage.getItem("notifications")) || []);
    fetchReminders();

    const notificationSocket = new WebSocket(
      "wss://devlokcrm-production.up.railway.app/ws/notifications/"
    );
    const leadNotificationSocket = new WebSocket(
      "wss://devlokcrm-production.up.railway.app/ws/lead-notifications/"
    );

    notificationSocketRef.current = notificationSocket;
    leadNotificationSocketRef.current = leadNotificationSocket;

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        addNotification(data.message || data.notification || "New notification");
      } catch (err) {
        console.error("WS message error:", err);
      }
    };

    notificationSocket.onmessage = handleMessage;
    leadNotificationSocket.onmessage = handleMessage;

    notificationSocket.onerror = console.error;
    leadNotificationSocket.onerror = console.error;

    intervalRef.current = setInterval(fetchReminders, 300000); // 5 min

    return () => {
      // Cleanup: close WebSockets and interval
      notificationSocket.close();
      leadNotificationSocket.close();
      clearInterval(intervalRef.current);
    };
  }, [role]); // only re-run when role changes

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.setItem("notifications", JSON.stringify([]));
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, clearNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
