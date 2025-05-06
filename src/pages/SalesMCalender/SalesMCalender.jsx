import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import styles from "./SalesMCalender.module.css";
import StaffLayout from "../../components/Layouts/SalesMLayout";
import AddEventModal from "../../components/Modals/AddEventModal";

dayjs.extend(utc);
dayjs.extend(timezone);

const SalesMCalendar = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [addEventModalOpen, setAddEventModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFollowupsAndEvents();
  }, [location]);

  const fetchFollowupsAndEvents = async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        "https://devlokcrmbackend.up.railway.app/followups/salesmanager_all_events/",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const eventList = response.data.events || [];
      const followupList = response.data.followups || [];

      const formattedEvents = eventList.map((event) => ({
        id: event.id,
        name: event.event_name,
        date: dayjs(event.date_time).tz("UTC").format("YYYY-MM-DD"),
        time: dayjs(event.date_time).format("hh:mm A"),
        priority: event.priority,
        notes: event.notes,
        type: "event",
      }));

      const formattedFollowups = followupList.map((followup) => ({
        id: followup.id,
        name: `Follow-up: ${followup.customer_name}`,
        date: dayjs(followup.followup_date).tz("UTC").format("YYYY-MM-DD"),
        time: dayjs(followup.followup_date).format("hh:mm A"),
        priority: "Medium",
        notes: followup.notes,
        type: "followup",
      }));

      const allItems = [...formattedEvents, ...formattedFollowups];

      const eventMap = {};
      allItems.forEach((item) => {
        if (!eventMap[item.date]) {
          eventMap[item.date] = [];
        }
        eventMap[item.date].push(item);
      });

      setEvents(allItems);
      setMarkedDates(eventMap);
    } catch (error) {
      console.error("Error fetching events and follow-ups:", error);
      setError("Failed to fetch events and follow-ups. Please try again.");
      if (error.response && error.response.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
    setModalOpen(true);
  };

  const handleAddEventClick = () => {
    setAddEventModalOpen(true);
  };

  

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const accessToken = localStorage.getItem("access_token");
      await axios.delete(
        `https://devlokcrmbackend.up.railway.app/task/salesmanager_event_delete/${eventId}/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      alert("Event deleted successfully!");
      fetchFollowupsAndEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event.");
    }
  };


  
  


  const formattedSelectedDate = dayjs(date).format("YYYY-MM-DD");
  const selectedDateEvents = markedDates[formattedSelectedDate] || [];

  return (
    <StaffLayout>
      <div className={styles.calendarContainer}>
        <button className={styles.addEventButton} onClick={handleAddEventClick}>
          ➕ Add Event
        </button>
        <h2 className={styles.calendarTitle}>Sales Manager Calendar</h2>

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
                
                  // Limit to 2 events
                  const eventsToShow = dateEvents.slice(0, 2);
                  const moreCount = dateEvents.length - 2;
                
                  return (
                    <div className={styles.eventList}>
                      {eventsToShow.map((event, index) => (
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
                      {moreCount > 0 && (
                        <div className={styles.moreEvents}>
                          +{moreCount} more
                        </div>
                      )}
                    </div>
                  );
                }}
                
              
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {modalOpen && (
              <div className={styles.modalOverlay}>
                <div className={styles.modalContent}>
                  <button
                    className={styles.closeButton}
                    onClick={() => setModalOpen(false)}
                  >
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
                            <span className={styles.eventTime}>
                              ⏰ {event.time}
                            </span>
                            <span className={styles.eventPriority}>
                              {event.priority} Priority
                            </span>
                          </div>
                          <p className={styles.eventNotes}>{event.notes}</p>
                          {event.type === "event" && (
                            <>
                              {/* <button
                                className={styles.editButton}
                                onClick={() => handleEditEvent(event.id)}
                              >
                                ✏️ Edit
                              </button> */}
                              <button
                                className={styles.deleteButton}
                                onClick={() => handleDeleteEvent(event.id)}
                              >
                                🗑 Delete
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <AddEventModal isOpen={addEventModalOpen} onClose={() => {
              setAddEventModalOpen(false);
              fetchFollowupsAndEvents();
            }} />
          </>
        )}
      </div>
    </StaffLayout>
  );
};

export default SalesMCalendar;
