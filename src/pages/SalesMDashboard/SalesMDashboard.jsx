import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Bar, Line } from "react-chartjs-2";
import StaffLayout from "../../components/Layouts/SalesMLayout";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from "chart.js";
import styles from "./SalesMDashboard.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

const SalesMDashboard = () => {
  const [crmData, setCrmData] = useState([]);
  const [leadData, setLeadData] = useState(null);
  const [events, setEvents] = useState({ followups: [], events: [] });
  const [notifications, setNotifications] = useState([]);
  const accessToken = localStorage.getItem("access_token");

  const notificationSocketRef = useRef(null);
  const leadNotificationSocketRef = useRef(null);

  useEffect(() => {
    // Load notifications from localStorage on first render
    const saved = localStorage.getItem("salesmanager_notifications");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotifications(parsed);
      } catch (err) {
        console.error("Error parsing saved notifications:", err);
      }
    }

    fetchAllData();
    const cleanupSockets = setupWebSockets();

    const reminderInterval = setInterval(fetchFollowupReminders, 5 * 60 * 1000);
    const eventInterval = setInterval(fetchUpcomingEvents, 60 * 60 * 1000);

    return () => {
      clearInterval(reminderInterval);
      clearInterval(eventInterval);
      if (notificationSocketRef.current) notificationSocketRef.current.close();
      if (leadNotificationSocketRef.current) leadNotificationSocketRef.current.close();
    };
  }, []);

  const fetchAllData = async () => {
    fetchCrmPerformance();
    fetchLeadGraph();
    fetchUpcomingEvents();
    fetchFollowupReminders();
  };

  const fetchCrmPerformance = async () => {
    try {
      const res = await axios.get("https://devlokcrm-production.up.railway.app/leads/salesmanager_crm_performance/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setCrmData(res.data || []);
    } catch (error) {
      console.error("CRM error:", error);
    }
  };

  const fetchLeadGraph = async () => {
    try {
      const res = await axios.get("https://devlokcrm-production.up.railway.app/leads/salesmanager_lead_graph_total/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setLeadData(res.data || {});
    } catch (error) {
      console.error("Lead graph error:", error);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const res = await axios.get("https://devlokcrm-production.up.railway.app/followups/Upcomming_salesmanager_event/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setEvents({
        followups: res.data.followups || [],
        events: res.data.events || [],
      });
    } catch (error) {
      console.error("Upcoming events error:", error);
    }
  };

  const fetchFollowupReminders = async () => {
    try {
      const res = await axios.get("https://devlokcrm-production.up.railway.app/followups/followup-reminders/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const reminderMessages = res.data.notifications?.map((n) => n.message) || [];
      reminderMessages.forEach((msg) => addNotification(msg));
    } catch (error) {
      console.error("Followup reminders error:", error);
    }
  };

  const setupWebSockets = () => {
    const notificationSocket = new WebSocket("ws://127.0.0.1:8001/ws/notifications/");
    const leadNotificationSocket = new WebSocket("ws://127.0.0.1:8001/ws/lead-notifications/");

    notificationSocketRef.current = notificationSocket;
    leadNotificationSocketRef.current = leadNotificationSocket;

    notificationSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const msg = data.message || String(event.data);
      addNotification(msg);
    };

    leadNotificationSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const msg = data.message || "New lead notification received";
      addNotification(msg);
    };

    return () => {
      notificationSocket.close();
      leadNotificationSocket.close();
    };
  };

  const addNotification = (message) => {
    const newNote = {
      message,
      timestamp: new Date().toISOString(),
    };

    setNotifications((prev) => {
      const updated = [newNote, ...prev];
      localStorage.setItem("salesmanager_notifications", JSON.stringify(updated));
      return updated;
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem("salesmanager_notifications");
  };
  

  const formatDate = (str) => {
    const d = new Date(str);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };
  

  return (
    <StaffLayout>
      <h2>Sales Manager Dashboard</h2>
      <div className={styles.dashboard}>
        <div className={styles.graphContainer}>
          <h3>CRM Performance</h3>
          {crmData.length > 0 ? (
            <Line
              data={{
                labels: crmData.map((item) => item.month),
                datasets: [
                  {
                    label: "Conversion Rate (%)",
                    data: crmData.map((item) => item.conversion_rate),
                    borderColor: "#4B7BEC",
                    backgroundColor: "rgba(75, 123, 236, 0.2)",
                    tension: 0.4,
                  },
                ],
              }}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          ) : (
            <p>No data available</p>
          )}
        </div>

        <div className={styles.graphContainer}>
          <h3>Leads Overview</h3>
          {leadData ? (
            <Bar
              data={{
                labels: ["Total", "Closed", "Unsuccessful", "Unrecorded"],
                datasets: [
                  {
                    label: "Leads",
                    data: [
                      leadData.total_leads || 0,
                      leadData.successfully_closed || 0,
                      leadData.unsuccess_leads || 0,
                      leadData.unrecorded_leads || 0,
                    ],
                    backgroundColor: ["#007bff", "#28a745", "#dc3545", "#ffc107"],
                  },
                ],
              }}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          ) : (
            <p>Loading lead data...</p>
          )}
        </div>

        <div className={styles.eventsContainer}>
          <h3>Upcoming Followups</h3>
          {events.followups.length > 0 ? (
            <ul>
              {events.followups.map((f, i) => (
                <li key={i}>
                  <strong>{f.customer_name}</strong> — {f.purpose}
                  <br />
                  <small>{formatDate(f.followup_date)}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p>No upcoming followups</p>
          )}

          <h3>Upcoming Events</h3>
          {events.events.length > 0 ? (
            <ul>
              {events.events.map((e, i) => (
                <li key={i}>
                  <strong>{e.event_name}</strong> — {e.priority}
                  <br />
                  <small>{formatDate(e.date_time)}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p>No upcoming events</p>
          )}
          <a href="/upcoming_events">View More</a>
        </div>

        <div className={styles.notificationsContainer}>
          <h3>Live Notifications</h3>
          <button onClick={clearNotifications} className={styles.clearBtn}>
      Clear All
    </button>
          {notifications.length > 0 ? (
            <ul>
              {notifications
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map((note, idx) => (
                  <li key={idx}>
                    <strong>{note.message}</strong>
                    <br />
                    <small>{formatDate(note.timestamp)}</small>
                  </li>
                ))}
            </ul>
          ) : (
            <p>No new notifications</p>
          )}
        </div>
      </div>
    </StaffLayout>
  );
};

export default SalesMDashboard;
