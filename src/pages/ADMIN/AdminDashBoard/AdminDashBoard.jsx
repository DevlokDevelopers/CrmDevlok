import { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Line } from "react-chartjs-2";
import AdminLayout from "../../../components/Layouts/AdminLayout";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../../components/NotificationContext/Notification Context"; // Importing the context hook
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
import styles from "./AdminDashBoard.module.css";

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

const AdminDashboard = () => {
  const [crmData, setCrmData] = useState([]);
  const [leadData, setLeadData] = useState(null);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("access_token");

  const { notifications, clearNotifications } = useNotifications();  // Accessing notifications and the clear function from context

  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
      return;
    }

    fetchCrmPerformance();
    fetchLeadGraph();
    fetchUpcomingEvents();

    const socketCleanup = setupWebSocket();
    fetchReminders(); // Initial fetch

    const reminderInterval = setInterval(fetchReminders, 300000); // every 5 minutes

    return () => {
      clearInterval(reminderInterval);
      socketCleanup();
    };
  }, []);  // Empty dependency ensures these effects run only once

  const fetchCrmPerformance = async () => {
    try {
      const res = await axios.get("https://devlokcrmbackend.up.railway.app/leads/admin_crm_performance_graph/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setCrmData(res.data || []);
    } catch (error) {
      console.error("Error fetching CRM performance:", error);
    }
  };

  const fetchLeadGraph = async () => {
    try {
      const res = await axios.get("https://devlokcrmbackend.up.railway.app/leads/admin_crm_graph_leads/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setLeadData(res.data || {});
    } catch (error) {
      console.error("Error fetching lead graph:", error);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const res = await axios.get("https://devlokcrmbackend.up.railway.app/task/todays_upcoming_events/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setEvents(res.data || []);
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
    }
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
    const notificationSocket = new WebSocket("wss://devlokcrmbackend.up.railway.app/ws/notifications/");
    const leadNotificationSocket = new WebSocket("wss://devlokcrmbackend.up.railway.app/ws/lead-notifications/");

    notificationSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data.message || data);
      } catch (err) {
        console.error("Notification parse error:", err);
      }
    };

    leadNotificationSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data.message || data);
      } catch (err) {
        console.error("Lead notification parse error:", err);
      }
    };

    notificationSocket.onerror = (error) => {
      console.error("Notification WebSocket error:", error);
    };

    leadNotificationSocket.onerror = (error) => {
      console.error("Lead WebSocket error:", error);
    };

    const reconnectWebSocket = () => {
      setTimeout(() => {
        setupWebSocket();
      }, 5000); // Reconnect after 5 seconds
    };

    notificationSocket.onclose = reconnectWebSocket;
    leadNotificationSocket.onclose = reconnectWebSocket;

    return () => {
      notificationSocket.close();
      leadNotificationSocket.close();
    };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    const hh = date.getHours().toString().padStart(2, "0");
    const min = date.getMinutes().toString().padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  };

  return (
    <AdminLayout>
      <h2>Admin Dashboard</h2>
      <div className={styles.dashboard}>
        <div className={`${styles.graphContainer} ${styles.crm}`}>
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

        <div className={`${styles.graphContainer} ${styles.leads}`}>
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
          <h3>Upcoming Events</h3>
          {events.length > 0 ? (
            <ul>
              {events.map((event, index) => (
                <li key={`e-${index}`}>
                  <strong>{event.event_name}</strong> — {event.priority}
                  <br />
                  <small>{formatDate(event.date_time)}</small>
                  <br />
                  <em>{event.notes}</em>
                </li>
              ))}
            </ul>
          ) : (
            <p>No upcoming events</p>
          )}
          <a href="/adminUpcoming">View More</a>
        </div>

        <div className={styles.notificationsContainer}>
          <h3>Live Notifications</h3>
          <button onClick={clearNotifications} className={styles.clearBtn}>
            Clear All
          </button>
          {notifications.length > 0 ? (
            <ul>
              {notifications.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          ) : (
            <p>No new notifications</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
