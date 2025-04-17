import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import styles from "./AdminCalender.module.css";
import AdminLayout from "../../../components/Layouts/AdminLayout";
import AdminAddEventModal from "../../../components/Modals/AdminModal/AddEventAdmin";

dayjs.extend(utc);
dayjs.extend(timezone);

const AdminCalendar = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [addEventModalOpen, setAddEventModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, [location]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        navigate("/login");
        return;
      }

      const response = await axios.get("https://devlokcrm-production.up.railway.app/task/admin_sheduled_events/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const rawEvents = response.data || [];

      const formattedEvents = rawEvents.map((event) => ({
        id: event.id,
        name: event.event_name || "Unnamed Event",
        date: dayjs(event.date_time).format("YYYY-MM-DD"),
        time: dayjs(event.date_time).format("hh:mm A"),
        priority: event.priority,
        notes: event.notes,
      }));

      const eventMap = {};
      formattedEvents.forEach((item) => {
        if (!eventMap[item.date]) eventMap[item.date] = [];
        eventMap[item.date].push(item);
      });

      setEvents(formattedEvents);
      setMarkedDates(eventMap);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to fetch events. Please try again.");
      if (error.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
    setEventModalOpen(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const accessToken = localStorage.getItem("access_token");
      await axios.delete(`https://devlokcrm-production.up.railway.app/task/event_delete/${eventId}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      alert("Event deleted successfully!");
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event.");
    }
  };

  const formattedSelectedDate = dayjs(date).format("YYYY-MM-DD");
  const selectedDateEvents = markedDates[formattedSelectedDate] || [];

  return (
    <AdminLayout>
      <div className={styles.calendarContainer}>
        <button className={styles.addEventButton} onClick={() => setAddEventModalOpen(true)}>
          ➕ Add Event
        </button>
        <h2 className={styles.calendarTitle}>Admin Calendar</h2>

        {loading ? (
          <div className={styles.loading}>Loading events...</div>
        ) : (
          <>
            <div className={styles.calendarWrapper}>
              <Calendar
                onChange={handleDateChange}
                value={date}
                className={styles.customCalendar}
                tileContent={({ date }) => {
                  const formattedDate = dayjs(date).format("YYYY-MM-DD");
                  const dateEvents = markedDates[formattedDate] || [];
                  return (
                    <div className={styles.eventList}>
                      {dateEvents.map((event, index) => (
                        <div
                          key={index}
                          className={`${styles.eventItem} ${
                            event.priority === "High"
                              ? styles.dotHigh
                              : event.priority === "Medium"
                              ? styles.dotMedium
                              : styles.dotLow
                          }`}
                        >
                          {event.name}
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {eventModalOpen && (
              <div className={styles.modalOverlay}>
                <div className={styles.modalContent}>
                  <button className={styles.closeButton} onClick={() => setEventModalOpen(false)}>
                    ✖
                  </button>
                  <h3 className={styles.modalTitle}>
                    🗓 Events on {dayjs(date).format("MMMM D, YYYY")}
                  </h3>
                  {selectedDateEvents.length === 0 ? (
                    <p className={styles.noEvents}>No events scheduled.</p>
                  ) : (
                    <div className={styles.eventsGrid}>
                      {selectedDateEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`${styles.eventCard} ${
                            event.priority === "High"
                              ? styles.highPriority
                              : event.priority === "Medium"
                              ? styles.mediumPriority
                              : styles.lowPriority
                          }`}
                        >
                          <div className={styles.eventHeader}>
                            <span className={styles.eventTime}>⏰ {event.time}</span>
                            <span className={styles.eventPriority}>{event.priority} Priority</span>
                          </div>
                          <p className={styles.eventNotes}>{event.notes}</p>
                          <button
                            className={styles.deleteButton}
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            🗑 Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <AdminAddEventModal
              isOpen={addEventModalOpen}
              onClose={() => {
                setAddEventModalOpen(false);
                fetchEvents();
              }}
            />
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCalendar;
