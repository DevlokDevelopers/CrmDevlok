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
    const newNotification = {
      message: msg,
      timestamp: new Date().toISOString(),
    };
    setNotifications((prev) => {
      if (prev.some((n) => n.message === msg)) return prev;
      const updated = [newNotification, ...prev];
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
    // Normalize any old string-based notifications
    const stored = JSON.parse(localStorage.getItem("notifications")) || [];
    const normalized = stored.map((n) =>
      typeof n === "string"
        ? { message: n, timestamp: new Date().toISOString() }
        : n
    );
    setNotifications(normalized);

    fetchReminders();

    const notificationSocket = new WebSocket(
      "wss://devlokcrmbackend.up.railway.app/ws/notifications/"
    );
    const leadNotificationSocket = new WebSocket(
      "wss://devlokcrmbackend.up.railway.app/ws/lead-notifications/"
    );

    notificationSocketRef.current = notificationSocket;
    leadNotificationSocketRef.current = leadNotificationSocket;

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const msg = data.message || data.notification || "New notification";
        addNotification(msg);
      } catch (err) {
        console.error("WS message error:", err);
      }
    };

    notificationSocket.onmessage = handleMessage;
    leadNotificationSocket.onmessage = handleMessage;

    notificationSocket.onerror = console.error;
    leadNotificationSocket.onerror = console.error;

    intervalRef.current = setInterval(fetchReminders, 5 * 60 * 1000);

    return () => {
      notificationSocket.close();
      leadNotificationSocket.close();
      clearInterval(intervalRef.current);
    };
  }, [role]);

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
